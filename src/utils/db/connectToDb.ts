import { MongoClient, Db } from "mongodb";
import { log } from "..";

const connectToDb = async (client: MongoClient): Promise<Db> => {
	try {
		if (!client.isConnected()) {
			await client.connect();
		}
		const db = client.db("algotia");
		return db;
	} catch (err) {
		log.error(err);
	}
};
export default connectToDb;
