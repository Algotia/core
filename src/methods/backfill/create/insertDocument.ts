import { log, getBackfillCollection } from "../../../utils";
import {
	BackfillDocument,
	OHLCV,
	BackfillInput,
	SingleCandleSet,
	MultiCandleSets
} from "../../../types";
import { MongoClient } from "mongodb";

const insertDocument = async (
	options: BackfillInput,
	candles: SingleCandleSet | MultiCandleSets,
	client: MongoClient
): Promise<BackfillDocument> => {
	try {
		const {
			since,
			until,
			period,
			pair,
			documentName,
			type = "single",
			exchanges
		} = options;

		const formatDate = (d) => new Date(d).getTime();

		const backfillCollection = await getBackfillCollection(client);

		const docCount = await backfillCollection.countDocuments();

		const docName: string = documentName || `backfill-${docCount + 1}`;

		const backfillDocument: BackfillDocument = {
			name: docName,
			since: formatDate(since),
			until: formatDate(until),
			candles,
			period,
			pair,
			type,
			exchanges
		};

		await backfillCollection.insertOne(backfillDocument);

		return backfillDocument;
	} catch (err) {
		log.error(err);
	}
};

export default insertDocument;
