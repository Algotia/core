import { getBacktestCollection } from "../../../utils";
import { BacktestDocument } from "../../../types";
import { MongoClient } from "mongodb";

type BacktestDocWithoutName = Omit<BacktestDocument, "name">;

const saveBacktest = async (
	backtest: BacktestDocWithoutName,
	mongoClient: MongoClient
): Promise<BacktestDocument> => {
	try {
		const backtestCollection = await getBacktestCollection(mongoClient);
		const documentCount = await backtestCollection.countDocuments();
		const backtestName = `backtest-${documentCount + 1}`;

		const backtestDocument: BacktestDocument = {
			...backtest,
			name: backtestName
		};

		await backtestCollection.insertOne(backtestDocument);

		return backtestDocument;
	} catch (err) {
		throw err;
	}
};

export default saveBacktest;
