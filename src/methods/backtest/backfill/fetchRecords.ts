import {
	Exchange,
	ProcessedBackfillOptions,
	AnyAlgotia,
	OHLCV,
} from "../../../types";
import {
	reshapeOHLCV,
	connectToDb,
	getBackfillCollection,
	buildRegexPath,
	parseTimeframe,
} from "../../../utils";
import getRecordsToFetch from "./getRecordsToFetch";
import saveSet from "./save";

const fetchSavedRecord = async (
	algotia: AnyAlgotia,
	exchange: Exchange,
	options: ProcessedBackfillOptions
) => {
	try {
		const db = await connectToDb(algotia.mongoClient);
		const backfillCollection = getBackfillCollection(db);
		const { until, since, timeframe } = options;

		const { unit, amount } = parseTimeframe(timeframe);
		const periodMS = unit * amount;
		const recordsBetween = Math.floor((until - since) / periodMS);

		const path = buildRegexPath(exchange.id, options.symbol, options.timeframe);
		const document = await backfillCollection.findOne({
			path: new RegExp(path),
		});

		const setOfTimestamps: number[][] = document.sets.map((set: OHLCV[]) => {
			return set.map(({ timestamp }) => timestamp);
		});
		const setContainingSince: number[] = setOfTimestamps.find((set) =>
			set.some((val) => val === since)
		);

		const indexOfSince = setContainingSince.indexOf(since);
		const records = setContainingSince.slice(indexOfSince, recordsBetween);
		return records;
	} catch (err) {
		throw err;
	}
};

const fetchRecords = async (
	algotia: AnyAlgotia,
	exchange: Exchange,
	options: ProcessedBackfillOptions
) => {
	try {
		const { OHLCVRecordLimit } = exchange;
		const { since, timeframe, symbol } = options;
		const recordsToFetch = await getRecordsToFetch(algotia, exchange, options);
		console.log("Records to fetch", recordsToFetch);

		if (recordsToFetch === 0) {
			const timeframeDoc = await fetchSavedRecord(algotia, exchange, options);
			console.log("FETCHED");
			console.log(timeframeDoc.length);
			return timeframeDoc;
		}
		if (recordsToFetch < OHLCVRecordLimit) {
			const rawOHLCV = await exchange.fetchOHLCV(
				symbol,
				timeframe,
				since,
				recordsToFetch
			);
			const formattedOHLCV = reshapeOHLCV(rawOHLCV);
			await saveSet(algotia, options, formattedOHLCV);
			console.log("INSERTED");
			console.log(formattedOHLCV.length);
			return formattedOHLCV;
		}
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
