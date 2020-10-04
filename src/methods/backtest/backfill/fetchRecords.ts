import { ProcessedBackfillOptions, AnyAlgotia, OHLCV } from "../../../types";
import {
	reshapeOHLCV,
	connectToDb,
	getBackfillCollection,
	buildRegexPath,
} from "../../../utils";
import getTimestampsToFetch from "./getTimestampsToFetch";
import saveSet from "./save";

const getWholeBackfillSet = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions
): Promise<OHLCV[]> => {
	const { symbol, timeframe, exchange } = options;

	const db = await connectToDb(algotia.mongoClient);

	const backfillCollection = getBackfillCollection(db);

	const path = buildRegexPath(exchange.id, symbol, timeframe);

	const set = await backfillCollection.findOne({
		path,
	});
	const sorted = set.sets.sort((a: OHLCV, b: OHLCV) => {
		return a.timestamp - b.timestamp;
	});
	return sorted;
};

const getRecordsFromDb = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions
) => {
	try {
		const { since, recordsBetween, periodMS } = options;

		const backfillSet = await getWholeBackfillSet(algotia, options);

		const startingCandle = backfillSet.find((val) => {
			return val.timestamp === since;
		});

		const indexOfStartingCandle = backfillSet.indexOf(startingCandle);

		const endingCandleTimestamp = since + periodMS * (recordsBetween - 1);

		const endingCandle = backfillSet.find((val) => {
			return val.timestamp === endingCandleTimestamp;
		});
		const indexOfEndingCandle = backfillSet.indexOf(endingCandle);
		console.log(indexOfStartingCandle, indexOfEndingCandle);

		const slice = backfillSet.slice(
			indexOfStartingCandle,
			indexOfEndingCandle + 1
		);
		return slice;
	} catch (err) {
		throw err;
	}
};

const getRecordsFromExchange = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions,
	timestampsToFetch: number[]
) => {
	try {
		const { timeframe, symbol, exchange } = options;
		if (timestampsToFetch.length < exchange.OHLCVRecordLimit) {
			console.log(exchange.id);
			const rawOHLCV = await exchange.fetchOHLCV(
				symbol,
				timeframe,
				timestampsToFetch[0],
				timestampsToFetch.length
			);
			const formattedOHLCV = reshapeOHLCV(rawOHLCV);
			await saveSet(algotia, options, formattedOHLCV);
			return formattedOHLCV;
		} else {
			//TODO: Paginate requests
		}
	} catch (err) {
		throw err;
	}
};

const fetchRecords = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions
) => {
	try {
		const timestampsToFetch = await getTimestampsToFetch(algotia, options);

		console.log(timestampsToFetch);
		if (timestampsToFetch.length !== 0) {
			return await getRecordsFromExchange(algotia, options, timestampsToFetch);
		}

		return await getRecordsFromDb(algotia, options);
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
