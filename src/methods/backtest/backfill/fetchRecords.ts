import {
	ProcessedBackfillOptions,
	AnyAlgotia,
	OHLCV,
	SingleBackfillSet,
	BackfillOptions,
	ExchangeID,
	Exchange,
} from "../../../types";
import {
	reshapeOHLCV,
	getBackfillCollection,
	buildRegexPath,
	debugLog,
	parseDate,
	getDefaultExchange,
	parseTimeframe,
} from "../../../utils";
import { Collection } from "mongodb";

const sleep = async (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

const fetchOHLCV = async (
	options: ProcessedBackfillOptions,
	exchange: Exchange,
	chunks: number[][]
): Promise<OHLCV[]> => {
	try {
		let candles: OHLCV[] = [];
		for (const chunk of chunks) {
			const since = chunk[0];

			const { pair, timeframe, periodMS } = options;
			const { OHLCVRecordLimit } = exchange;

			let candleSet: OHLCV[] = [];
			let sinceCursor = since;
			let recordsToFetch = chunk.length;
			let page = 0;

			while (candleSet.length < recordsToFetch) {
				if (page) {
					await sleep(1000);
				}
				const recordsLeft = recordsToFetch - candleSet.length;
				const limit =
					recordsLeft > OHLCVRecordLimit ? OHLCVRecordLimit : recordsLeft;

				const rawOHLCV = await exchange.fetchOHLCV(
					pair,
					timeframe,
					sinceCursor,
					limit
				);

				const ohlcv = reshapeOHLCV(rawOHLCV, periodMS);

				debugLog(`Page ${page + 1}: ${sinceCursor} -> ${ohlcv.length} records`);

				candles.push(...ohlcv);
				sinceCursor = ohlcv[ohlcv.length - 1].timestamp;
				recordsToFetch -= ohlcv.length;
				page++;
			}
		}
		return candles;
	} catch (err) {
		throw err;
	}
};

const getNewRecords = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions,
	chunks: number[][]
): Promise<void> => {
	try {
		const { exchange, pair, timeframe } = options;

		const timeframePath = buildRegexPath(exchange.id, pair, timeframe);

		const candleSet = await fetchOHLCV(options, exchange, chunks);

		debugLog(`CCXT fetchOHLCV response length: ${candleSet.length}`);
		debugLog(`Saving records with path ${timeframePath}`);

		if (candleSet.length) {
			const candleSetWithPath = candleSet.map((ohlcv) => {
				return {
					...ohlcv,
					path: timeframePath,
				};
			});
			await backfillCollection.insertMany(candleSetWithPath);
		}
	} catch (err) {
		debugLog(err.message, "error");
		throw err;
	}
};

const getRecordsFromDb = async (
	backfillCollection: Collection,
	options: BackfillOptions,
	id: ExchangeID
): Promise<SingleBackfillSet> => {
	try {
		const { since, until, timeframe, pair } = options;

		const path = buildRegexPath(id, pair, timeframe);

		debugLog(`Querying DB for records with path \n \t ${path}`);

		const candles = await backfillCollection
			.find<OHLCV>(
				{
					path,
					timestamp: { $gte: since, $lt: until },
				},
				{
					projection: {
						_id: false,
						path: false,
					},
					sort: {
						timestamp: 1,
					},
				}
			)
			.toArray();

		debugLog(`DB query returned ${candles.length} results`);

		return candles;
	} catch (err) {
		throw err;
	}
};

const processFetchOptions = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchangeId?: ExchangeID
): ProcessedBackfillOptions => {
	const { until, since, timeframe } = options;

	const sinceMs = parseDate(since);
	const untilMs = parseDate(until);

	let exchange: Exchange;
	if (!exchangeId) {
		exchange = getDefaultExchange(algotia);
	} else {
		exchange = algotia.exchanges[exchangeId];
	}

	const { periodMS } = parseTimeframe(timeframe);
	const recordsBetween = Math.floor((untilMs - sinceMs) / periodMS);

	return {
		...options,
		periodMS,
		recordsBetween,
		since: sinceMs,
		until: untilMs,
		exchange,
	};
};

const getTimestampsToFetch = async (
	options: ProcessedBackfillOptions,
	backfillCollection: Collection,
	id: ExchangeID
): Promise<number[][]> => {
	try {
		const { recordsBetween, since, periodMS } = options;

		const dbRecords = await getRecordsFromDb(backfillCollection, options, id);

		if (dbRecords.length === recordsBetween) {
			return [];
		} else {
			const dbTimestamps = dbRecords.map(({ timestamp }) => timestamp);

			let tempTimestampArr: number[] = [];

			for (let i = 0; i < recordsBetween; i++) {
				const timestamp = since + periodMS * i;
				tempTimestampArr.push(timestamp);
			}

			debugLog(`DB contains ${dbTimestamps.length} records`);

			const needToFetch = tempTimestampArr.filter(
				(el) => !dbTimestamps.includes(el)
			);

			debugLog(`Need to fetch ${needToFetch.length} records`);

			let chunks: number[][] = [];
			let tempArr: number[] = [];

			for (let i = 0; i < needToFetch.length; i++) {
				const thisTimestamp = needToFetch[i];
				const nextTimestamp = needToFetch[i + 1];

				tempArr.push(thisTimestamp);

				if (i === needToFetch.length - 1) {
					chunks.push(tempArr);
					break;
				}

				if (nextTimestamp - thisTimestamp !== periodMS) {
					chunks.push(tempArr);
					tempArr = [];
				}
			}

			return chunks;
		}
	} catch (err) {
		throw err;
	}
};

const fetchRecords = async (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchangeId?: ExchangeID
): Promise<SingleBackfillSet> => {
	try {
		const backfillCollection = getBackfillCollection(algotia.mongo);

		const processedOptions = processFetchOptions(algotia, options, exchangeId);
		const id = processedOptions.exchange.id;

		debugLog(
			`${processedOptions.recordsBetween} records between \n \t ${
				new Date(processedOptions.since).toDateString() +
				" " +
				new Date(processedOptions.since).toTimeString()
			} \n \t ${
				new Date(processedOptions.until).toDateString() +
				" " +
				new Date(processedOptions.until).toTimeString()
			}`
		);
		// Get chunks of timestamps to fetch, less the
		// records already saved in DB
		const chunksToFetch = await getTimestampsToFetch(
			processedOptions,
			backfillCollection,
			id
		);

		const recordsToFetch = chunksToFetch
			.map((arr) => {
				return arr.length;
			})
			.reduce((a, b) => a + b, 0);

		if (recordsToFetch) {
			debugLog(
				`Fetching ${recordsToFetch} records from ${id} in ${chunksToFetch.length} chunks.`
			);

			await getNewRecords(backfillCollection, processedOptions, chunksToFetch);
		}

		// fetch all requested candles from db
		const records = await getRecordsFromDb(
			backfillCollection,
			processedOptions,
			id
		);

		debugLog(
			`Backfill return ${records.length} OHLCV candles.`,
			"return_value"
		);

		return records;
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;