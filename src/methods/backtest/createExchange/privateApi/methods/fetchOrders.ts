import { MethodFactoryArgs, fetchOrders } from "../../../../../types";
import { getActiveBacktest } from "../helpers";
import { Order, Params } from "ccxt";

const factory = (args: MethodFactoryArgs) => {
	const { collections } = args;
	const fetchOrders: fetchOrders = async (
		symbol?: string,
		since?: number,
		limit?: number,
		params?: Params
	): Promise<Order[]> => {
		try {
			const activeBacktest = await getActiveBacktest(collections);

			return activeBacktest.orders;
		} catch (err) {
			throw err;
		}
	};
	return fetchOrders;
};

export default factory;
