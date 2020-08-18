import { Collection, MongoClient } from "mongodb";
import connectToDb from "./connectToDb";

const getBackfillCollection = async (
	client: MongoClient
): Promise<Collection> => {
	try {
		const db = await connectToDb(client);
		return db.collection("backfill");
	} catch (err) {
		throw err;
	}
};

export default getBackfillCollection;
