import { MongoClient } from "mongodb";
import { BacktestOtions } from "../../types/index";

import { engine } from "../factories/engine";

const connectToDatabase = async () => {
	const dbUrl = "mongodb://localhost:27017";
	const dbOptions = {
		useUnifiedTopology: true,
	};
	const client = new MongoClient(dbUrl, dbOptions);

	await client.connect();

	return client;
};

const closeDatabaseConnection = async (client: MongoClient) => {
	await client.close();
};

const backtest = async (options: BacktestOtions): Promise<void> => {
	try {
		const { dataSet, strategy } = options;

		const client = await connectToDatabase();
		const db = client.db("algotia");
		const backfillCollection = db.collection("backfill");
		const backfillArr = await backfillCollection
			.find({ name: dataSet })
			.toArray();
		const backfill = backfillArr[0];
		const backfillLength = backfill.records.length;

		for (let i = 0; i < backfillLength; i++) {
			engine.execute(strategy, backfill.records[i]);
		}

		await closeDatabaseConnection(client);
		return;
	} catch (err) {
		return Promise.reject(err);
	}
};

export default backtest;
