import { Collection, MongoClient } from "mongodb";
import { log } from "..";
import connectToDb from "./connectToDb";

const getBackfillCollection = async (
	client: MongoClient
): Promise<Collection> => {
	try {
		const db = await connectToDb(client);

		return db.collection("backfill");
	} catch (err) {
		log.error(err);
	}
};

export default getBackfillCollection;
