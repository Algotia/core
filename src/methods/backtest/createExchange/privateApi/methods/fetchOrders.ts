import { MethodFactoryArgs } from "../../../../../types";
import { Order, Params } from "ccxt";

const factory = (args: MethodFactoryArgs) => {
	const { collections, redisClient } = args;
	const fetchOrders = async (
		symbol?: string,
		since?: number,
		limit?: number,
		params?: Params
	): Promise<string[]> => {
		try {
			const orders = await redisClient.lrange("openOrders", 0, -1);

			return orders;
		} catch (err) {
			throw err;
		}
	};
	return fetchOrders;
};

export default factory;
