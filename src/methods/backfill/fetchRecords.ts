import {
	ProcessedBackfillOptions,
	AnyAlgotia,
	OHLCV,
	SingleBackfillSet,
	BackfillOptions,
	ExchangeID,
	Exchange,
} from "../../types";
import {
	reshapeOHLCV,
	getBackfillCollection,
	buildRegexPath,
	debugLog,
	parseDate,
	getDefaultExchange,
	parseTimeframe,
} from "../../utils";
import { Collection } from "mongodb";

const sleep = async (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

/** Fetch OHLCV candles from exchange and insert them into database*/
const fetchOHLCV = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions,
	chunks: number[][]
): Promise<void> => {
	try {
		const { exchange, asset, timeframe, periodMS } = options;

		const timeframePath = buildRegexPath(exchange.id, asset, timeframe);

		let candles: OHLCV[] = [];
		for (const chunk of chunks) {
			const since = chunk[0];

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
					asset,
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

		const candlesWithPath = candles.map((candle) => {
			return {
				...candle,
				path: timeframePath,
			};
		});

		await backfillCollection.insertMany(candlesWithPath);
	} catch (err) {
		throw err;
	}
};

/** Query database for records between since and until.*/
const getRecordsFromDb = async (
	backfillCollection: Collection,
	options: BackfillOptions,
	id: ExchangeID
): Promise<SingleBackfillSet> => {
	try {
		const { startDate, endDate, timeframe, asset } = options;

		const path = buildRegexPath(id, asset, timeframe);

		debugLog(`Querying DB for records with path \n \t ${path}`);

		const candles = await backfillCollection
			.find<OHLCV>(
				{
					path,
					timestamp: { $gte: startDate, $lt: endDate },
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

/** Convert options to friendy format for CCXT calls.*/
const processFetchOptions = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchangeId?: ExchangeID
): ProcessedBackfillOptions => {
	const { startDate: originalStartDate, endDate:  originalEndDate, timeframe } = options;

	// Convert since and until from Dates to unix timestamps (MS)
	const startDate = parseDate(originalStartDate);
	const endDate = parseDate(originalEndDate);

	let exchange: Exchange;
	if (!exchangeId) {
		exchange = getDefaultExchange(algotia);
	} else {
		exchange = algotia.exchanges[exchangeId];
	}

	const { periodMS } = parseTimeframe(timeframe);
	const recordsBetween = Math.floor((endDate - startDate) / periodMS);

	return {
		...options,
		startDate,
		endDate,
		periodMS,
		recordsBetween,
		exchange,
	};
};

/** Determine which timestamps need to be fetched, and return chunks of continuous timestamps.
 */
const getTimestampsToFetch = async (
	options: ProcessedBackfillOptions,
	backfillCollection: Collection,
	id: ExchangeID
): Promise<number[][]> => {
	try {
		const { recordsBetween, startDate, periodMS } = options;

		/** All records between since and until */
		const dbRecords = await getRecordsFromDb(backfillCollection, options, id);

		if (dbRecords.length === recordsBetween) {
			// All records exist
			return [];
		} else {
			/** All timestamps from db */
			const dbTimestamps = dbRecords.map(({ timestamp }) => timestamp);

			/** An array of all timestamps between since and until */
			let allTimestampsBetween: number[] = [];

			for (let i = 0; i < recordsBetween; i++) {
				const timestamp = startDate + periodMS * i;
				allTimestampsBetween.push(timestamp);
			}

			debugLog(`DB contains ${dbTimestamps.length} records`);

			/** All timestamps that do not exist in database */
			const needToFetch = allTimestampsBetween.filter(
				(el) => !dbTimestamps.includes(el)
			);

			debugLog(`Need to fetch ${needToFetch.length} records`);

			// Create chunks of continuous timestamps from timestamps
			// that need to be fetched
			// e.g.: [1, 2, 3, 8, 9, 10] --> [[1, 2, 3], [8, 9, 10]]
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

/** Fetch and cache records for single exchange */
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
				new Date(processedOptions.startDate).toDateString() +
				" " +
				new Date(processedOptions.startDate).toTimeString()
			} \n \t ${
				new Date(processedOptions.endDate).toDateString() +
				" " +
				new Date(processedOptions.endDate).toTimeString()
			}`
		);

		// Get chunks of timestamps to fetch, less the
		// records already saved in DB
		// e.g.: [[t1, t2, t3], [t4, t5, t6]]
		const chunksToFetch = await getTimestampsToFetch(
			processedOptions,
			backfillCollection,
			id
		);

		// Get total number of records to fetch
		const recordsToFetch = chunksToFetch
			.map((arr) => {
				return arr.length;
			})
			.reduce((prevLength, nextLength) => prevLength + nextLength, 0);

		// If recordsToFetch !== 0
		if (recordsToFetch) {
			debugLog(
				`Fetching ${recordsToFetch} records from ${id} in ${chunksToFetch.length} chunks.`
			);

			await fetchOHLCV(backfillCollection, processedOptions, chunksToFetch);
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
