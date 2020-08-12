import { log } from "../../utils";
import { BackfillDocument, OHLCV } from "../../types";
import { MongoClient } from "mongodb";

interface InsertOptions {
	sinceMs: number;
	untilMs: number;
	period: string;
	pair: string;
	documentName?: string;
	allRecords: OHLCV[];
}

const insertDocument = async (
	insertOptions: InsertOptions,
	client: MongoClient
): Promise<BackfillDocument> => {
	try {
		const {
			sinceMs,
			untilMs,
			period,
			pair,
			documentName,
			allRecords
		} = insertOptions;

		const db = client.db();
		const backfillCollection = db.collection("backfill");
		const docCount = await backfillCollection.countDocuments();

		const docName: string = documentName || `backfill-${docCount + 1}`;

		const backfillDocument: BackfillDocument = {
			name: docName,
			since: sinceMs,
			until: untilMs,
			records: allRecords,
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
