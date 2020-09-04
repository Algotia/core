import { log, getBackfillCollection } from "../../utils";
import { ConvertedBackfillOptions, BackfillDocument, OHLCV } from "../../types";
import { MongoClient } from "mongodb";

interface InsertOptions {
	userOptions: ConvertedBackfillOptions;
	userCandles: OHLCV[];
	internalCandles: OHLCV[];
}

const insertDocument = async (
	insertOptions: InsertOptions,
	client: MongoClient
): Promise<BackfillDocument> => {
	try {
		const { userOptions, userCandles, internalCandles } = insertOptions;
		const { sinceMs, untilMs, period, pair, documentName } = userOptions;

		const backfillCollection = await getBackfillCollection(client);

		const docCount = await backfillCollection.countDocuments();

		const docName: string = documentName || `backfill-${docCount + 1}`;

		const backfillDocument: BackfillDocument = {
			name: docName,
			since: sinceMs,
			until: untilMs,
			userCandles,
			internalCandles,
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
