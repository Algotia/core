import { MongoClient, Collection } from "mongodb";
import { BacktestInput } from "../../types";
import { getBacktestCollection, getBackfillCollection } from "../../utils";
import { Balance, Balances } from "ccxt";

const validateInput = async (
	backtestCollection: Collection,
	options: BacktestInput
) => {};

const initializeBacktest = async (
	client: MongoClient,
	options: BacktestInput
) => {
	const backfillCollection = await getBackfillCollection(client);
	const backtestCollection = await getBacktestCollection(client);

	const dataSet = await backfillCollection.findOne({
		name: options.documentName
	});
};
