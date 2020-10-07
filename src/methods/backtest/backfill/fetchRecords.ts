import {
	ProcessedBackfillOptions,
	AnyAlgotia,
	OHLCV,
	BackfillSetDocument,
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
import initializeBackfillTree from "../../../utils/db/initializeBackfillTree";

const getTimestampsToFetch = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions
): Promise<number[]> => {
	try {
		const {
			since,
			timeframe,
			symbol,
			periodMS,
			recordsBetween,
			exchange,
		} = options;

		const setPath = buildRegexPath(exchange.id, symbol, timeframe);
		const dbSets = await backfillCollection.findOne({
			path: setPath,
		});

		let allStampsToFetch = [];
		for (let i = 0; i < recordsBetween; i++) {
			if (i === 0) {
				allStampsToFetch[i] = since;
			}
			allStampsToFetch[i] = since + periodMS * i;
		}

		if (dbSets) {
			if (dbSets.candles && dbSets.candles.length) {
				const dbTimestamps = dbSets.candles.map(({ timestamp }) => timestamp);
				const timestampsToFetch = allStampsToFetch.filter((timestamp) => {
					return !dbTimestamps.includes(timestamp);
				});
				return timestampsToFetch;
			}
		} else {
			return allStampsToFetch;
		}
	} catch (err) {
		throw err;
	}
};

const getNewRecords = async (
	algotia: AnyAlgotia,
	backfillCollection: Collection,
	options: ProcessedBackfillOptions,
	timestampsToFetch: number[]
): Promise<void> => {
	try {
		const { exchange, symbol, timeframe } = options;
		if (timestampsToFetch.length < exchange.OHLCVRecordLimit) {
			// call CCXT method fetchOHLCV to retrieve candles

			const rawOHLCV = await exchange.fetchOHLCV(
				symbol,
				timeframe,
				timestampsToFetch[0],
				timestampsToFetch.length
			);

			debugLog(
				algotia,
				{
					label: `fetchOHLCV timestamps (length: ${rawOHLCV.length}) `,
					value: rawOHLCV.map((candle) => new Date(candle[0]).toISOString()),
				},
				"info"
			);

			const candleSet = reshapeOHLCV(rawOHLCV);

			// checks if parent nodes exist on tree if not creating them
			await initializeBackfillTree(backfillCollection, options);

			const timeframePath = buildRegexPath(exchange.id, symbol, timeframe);

			debugLog(
				algotia,
				`Inserting ${candleSet.length} objects onto array 'candles' at document with path ${timeframePath}`
			);
			// save retrieved candles to db
			await backfillCollection.updateOne(
				{ path: timeframePath },
				{ $push: { candles: { $each: candleSet } } }
			);
		} else {
			//TODO: Paginate requests
		}
	} catch (err) {
		debugLog(algotia, err.message, "error");
		throw err;
	}
};

const getRecordsFromDb = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions
): Promise<SingleBackfillSet> => {
	try {
		const {
			since,
			symbol,
			timeframe,
			exchange,
			recordsBetween,
			periodMS,
		} = options;

		const path = buildRegexPath(exchange.id, symbol, timeframe);

		const set: BackfillSetDocument = await backfillCollection.findOne({
			path,
		});

		const sortedBackfill = set.candles.sort((a, b) => {
			return a.timestamp - b.timestamp;
		});

		const findIndexOf = (arr: OHLCV[], val: OHLCV["timestamp"]): number => {
			const candle = arr.find(({ timestamp }) => timestamp === val);
			return arr.indexOf(candle);
		};

		const endingCandleTimestamp = since + periodMS * (recordsBetween - 1);

		const indexOfStartingCandle = findIndexOf(sortedBackfill, since);
		const indexOfEndingCandle = findIndexOf(
			sortedBackfill,
			endingCandleTimestamp
		);

		const slice = sortedBackfill.slice(
			indexOfStartingCandle,
			indexOfEndingCandle + 1
		);
		return slice;
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

const fetchRecords = async (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchangeId?: ExchangeID
): Promise<SingleBackfillSet> => {
	try {
		const db = algotia.mongo;
		const backfillCollection = getBackfillCollection(db);

		const processedOptions = processFetchOptions(algotia, options, exchangeId);

		// Determine which candles we actually need to fetch
		const timestampsToFetch = await getTimestampsToFetch(
			backfillCollection,
			processedOptions
		);

		// If there are any new timestamps to fetch
		if (timestampsToFetch.length !== 0) {
			// fetch candles from exchange
			await getNewRecords(
				algotia,
				backfillCollection,
				processedOptions,
				timestampsToFetch
			);
		}

		// fetch all requested candles from db
		const records = await getRecordsFromDb(
			backfillCollection,
			processedOptions
		);

		debugLog(algotia, `Pulled ${records.length} records from the database`);
		debugLog(
			algotia,
			{ label: "Backfill returned ", value: records },
			"return_value"
		);

		return records;
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
