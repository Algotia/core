import { MongoClient, Db } from "mongodb";

const connectToDb = async (client: MongoClient): Promise<Db> => {
	try {
		if (!client.isConnected()) {
			await client.connect();
		}
		const db = client.db("algotia");
		return db;
	} catch (err) {
		throw err;
	}
};
export default connectToDb;
