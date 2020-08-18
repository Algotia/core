import { log, getBackfillCollection } from "../../utils";
import { ConvertedBackfillOptions, BackfillDocument, OHLCV } from "../../types";
import { MongoClient } from "mongodb";

interface InsertOptions {
	convertedOptions: ConvertedBackfillOptions;
	records: OHLCV[];
}

const insertDocument = async (
	insertOptions: InsertOptions,
	client: MongoClient
): Promise<BackfillDocument> => {
	try {
		const { convertedOptions, records } = insertOptions;
		const { sinceMs, untilMs, period, pair, documentName } = convertedOptions;

		const backfillCollection = await getBackfillCollection(client);

		const docCount = await backfillCollection.countDocuments();

		const docName: string = documentName || `backfill-${docCount + 1}`;

		const backfillDocument: BackfillDocument = {
			name: docName,
			since: sinceMs,
			until: untilMs,
			records,
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
