import { AnyAlgotia, ProcessedBackfillOptions } from "../../../types";
import {
	connectToDb,
	getBackfillCollection,
	buildRegexPath,
} from "../../../utils";

const getTimestampsToFetch = async (
	algotia: AnyAlgotia,
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

		const db = await connectToDb(algotia.mongoClient);
		const backfillCollection = getBackfillCollection(db);

		const setPath = buildRegexPath(exchange.id, symbol, timeframe);
		const dbSets = await backfillCollection.findOne({
			path: setPath,
		});

		let timestampsToFetch = [];
		for (let i = 0; i < recordsBetween; i++) {
			if (i === 0) {
				timestampsToFetch[i] = since;
			}
			timestampsToFetch[i] = since + periodMS * i;
		}

		if (dbSets) {
			if (dbSets.sets.length) {
				const dbTimestamps = dbSets.sets.map(({ timestamp }) => timestamp);

				for (let j = 0; j < timestampsToFetch.length; j++) {
					const timestamp = timestampsToFetch[j];
					if (dbTimestamps.includes(timestamp)) {
						const indexOfStamp = timestampsToFetch.indexOf(timestamp);
						timestampsToFetch.splice(indexOfStamp, 1);
					}
				}
			}
		}

		return timestampsToFetch;
	} catch (err) {
		throw err;
	}
};

export default getTimestampsToFetch;
