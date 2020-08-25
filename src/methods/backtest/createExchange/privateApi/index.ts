import { MongoClient } from "mongodb";
import { Exchange } from "ccxt";
import {
	getBackfillCollection,
	getBacktestCollection
} from "../../../../utils";
import {
	PrivateApi,
	PrivateApiIds,
	MethodFactoryArgs
} from "../../../../types";
import privateApiFactories from "./methods/";

const createPrivateApis = async (
	exchange: Exchange,
	client: MongoClient
): Promise<PrivateApi> => {
	try {
		const backfill = await getBackfillCollection(client);
		const backtest = await getBacktestCollection(client);

		const collections = { backtest, backfill };

		const methodFactoryArgs: MethodFactoryArgs = {
			collections,
			exchange
		};

		//let privateApis = {};

		//for (const factoryName in privateApiFactories) {
		//const factory = privateApiFactories[factoryName];
		//const method = factory(methodFactoryArgs);

		//privateApis[factoryName] = method;
		//console.log(privateApis);
		//}
		const cancelOrder = privateApiFactories.cancelOrder(methodFactoryArgs);
		const createOrder = privateApiFactories.createOrder(methodFactoryArgs);
		const fetchOrders = privateApiFactories.fetchOrders(methodFactoryArgs);
		const fetchBalance = privateApiFactories.fetchBalance(methodFactoryArgs);

		const privateApis: PrivateApi = {
			cancelOrder,
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
