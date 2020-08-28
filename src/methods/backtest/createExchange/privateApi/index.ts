import { MongoClient } from "mongodb";
import { Exchange } from "ccxt";
import {
	getBackfillCollection,
	getBacktestCollection
} from "../../../../utils";
import { MethodFactoryArgs, PrivateApi } from "../../../../types";
import privateApiFactories from "./methods/";
import { Tedis } from "tedis";

const createPrivateApis = async (
	exchange: Exchange,
	client: MongoClient,
	redisClient: Tedis
): Promise<PrivateApi> => {
	try {
		const backfill = await getBackfillCollection(client);
		const backtest = await getBacktestCollection(client);

		const collections = { backtest, backfill };

		const methodFactoryArgs: MethodFactoryArgs = {
			redisClient,
			collections,
			exchange
		};

		//TODO: Do this more dynamically

		//const cancelOrder = privateApiFactories.cancelOrder(methodFactoryArgs);
		const createOrder = privateApiFactories.createOrder(methodFactoryArgs);
		const fetchOrders = privateApiFactories.fetchOrders(methodFactoryArgs);
		const fetchBalance = privateApiFactories.fetchBalance(methodFactoryArgs);

		const privateApis = {
			//cancelOrder,
			createOrder,
			fetchOrders,
			fetchBalance
		};

		return privateApis;
	} catch (err) {
		throw err;
	}
};

export default createPrivateApis;
