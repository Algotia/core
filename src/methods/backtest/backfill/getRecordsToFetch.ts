import {
	OHLCV,
	AnyAlgotia,
	Exchange,
	ProcessedBackfillOptions,
} from "../../../types";
import {
	parseTimeframe,
	connectToDb,
	getBackfillCollection,
	buildRegexPath,
} from "../../../utils";

const getRecordsToFetch = async (
	algotia: AnyAlgotia,
	exchange: Exchange,
	options: ProcessedBackfillOptions
): Promise<number> => {
	const { since, until, timeframe, symbol } = options;
	const { unit, amount } = parseTimeframe(timeframe);
	const periodMS = unit * amount;
	const recordsBetween = Math.floor((until - since) / periodMS);

	const db = await connectToDb(algotia.mongoClient);
	const backfillCollection = getBackfillCollection(db);

	const setPath = buildRegexPath(exchange.id, symbol, timeframe);
	const dbSets = await backfillCollection.findOne({
		path: new RegExp(setPath),
	});

	let recordsToFetch: number;

	if (dbSets) {
		if (dbSets.sets.length) {
			const dbTimestamps = dbSets.sets.map((set: OHLCV[]) =>
				set.map(({ timestamp }) => timestamp)
			);

			let timestampsToFetch = [];
			for (let i = 0; i < recordsBetween; i++) {
				if (i === 0) {
					timestampsToFetch[i] = since;
				}
				timestampsToFetch[i] = since + periodMS * i;
			}

			for (let j = 0; j < dbTimestamps.length; j++) {
				const set = dbTimestamps[j];
				for (let k = 0; k < set.length; k++) {
					const timestamp = set[k];
					if (timestampsToFetch.includes(timestamp)) {
						const indexOfStamp = timestampsToFetch.indexOf(timestamp);
						timestampsToFetch.splice(indexOfStamp, 1);
					}
				}
			}
			recordsToFetch = timestampsToFetch.length;
		} else {
			recordsToFetch = recordsBetween;
		}
	} else {
		recordsToFetch = recordsBetween;
	}

	return recordsToFetch;
};

export default getRecordsToFetch;
