import { Collection, MongoClient } from "mongodb";
import connectToDb from "./connectToDb";

const getBacktestCollection = async (
	client: MongoClient
): Promise<Collection> => {
	try {
		const db = await connectToDb(client);
		return db.collection("backtest");
	} catch (err) {
		throw err;
	}
};

export default getBacktestCollection;
