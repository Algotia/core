import {
	ProcessedBackfillOptions,
	AnyAlgotia,
	OHLCV,
	BackfillSetDocument,
	AllowedExchanges,
} from "../../../types";
import {
	reshapeOHLCV,
	connectToDb,
	getBackfillCollection,
	buildRegexPath,
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
	options: ProcessedBackfillOptions,
	timestampsToFetch: number[]
) => {
	const { exchange, symbol, timeframe } = options;
	if (timestampsToFetch.length < exchange.OHLCVRecordLimit) {
		// call CCXT method fetchOHLCV to retrieve candles
		const rawOHLCV = await exchange.fetchOHLCV(
			symbol,
			timeframe,
			timestampsToFetch[0],
			timestampsToFetch.length
		);
		const candleSet = reshapeOHLCV(rawOHLCV);
		// save retrieved candles to db
		const { mongoClient } = algotia;
		const db = await connectToDb(mongoClient);
		const backfillCollection = getBackfillCollection(db);

		await initializeBackfillTree(backfillCollection, options);

		const timeframePath = buildRegexPath(exchange.id, symbol, timeframe);

		await backfillCollection.updateOne(
			{ path: timeframePath },
			{ $push: { candles: { $each: candleSet } } }
		);
	} else {
		//TODO: Paginate requests
	}
};

const getRecordsFromDb = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions
) => {
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

const fetchRecords = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions
) => {
	try {
		const db = await connectToDb(algotia.mongoClient);
		const backfillCollection = getBackfillCollection(db);

		// Determine which candles we actually need to fetch
		const timestampsToFetch = await getTimestampsToFetch(
			backfillCollection,
			options
		);

		// If there are any new timestamps to fetch
		if (timestampsToFetch.length !== 0) {
			// fetch candles from exchange
			await getNewRecords(algotia, options, timestampsToFetch);
		}

		// fetch all requested candles from db
		return await getRecordsFromDb(backfillCollection, options);
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
