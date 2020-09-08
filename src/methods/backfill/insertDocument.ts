import { log, getBackfillCollection } from "../../utils";
import { ConvertedBackfillOptions, BackfillDocument, OHLCV } from "../../types";
import { MongoClient } from "mongodb";

const insertDocument = async (
	options: ConvertedBackfillOptions,
	candles: OHLCV[],
	client: MongoClient
): Promise<BackfillDocument> => {
	try {
		const { sinceMs, untilMs, period, pair, documentName } = options;

		const backfillCollection = await getBackfillCollection(client);

		const docCount = await backfillCollection.countDocuments();

		const docName: string = documentName || `backfill-${docCount + 1}`;

		const backfillDocument: BackfillDocument = {
			name: docName,
			since: sinceMs,
			until: untilMs,
			candles,
			period,
			pair
		};

		await backfillCollection.insertOne(backfillDocument);

		return backfillDocument;
	} catch (err) {
		log.error(err);
	}
};

export default insertDocument;
