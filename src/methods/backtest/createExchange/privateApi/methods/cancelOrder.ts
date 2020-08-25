import { cancelOrder, MethodFactoryArgs } from "../../../../../types";
import { Order } from "ccxt";
import { getActiveBacktest } from "../helpers";

const factory = (args: MethodFactoryArgs): cancelOrder => {
	const { collections } = args;
	const cancelOrder: cancelOrder = async (
		id: string,
		symbol?: string,
		params?: any
	): Promise<Order> => {
		try {
			const activeBacktest = await getActiveBacktest(collections);

			const orderToBeCancled: Order = activeBacktest.orders.find((order) => {
				return order.id === id;
			});

			if (!orderToBeCancled) {
				throw new Error(`Could not cancel order with the ID of ${id}`);
			}

			if (orderToBeCancled.symbol === symbol) {
				throw new Error(
					`Order with the id of ${id} does not have the symbol ${symbol}.`
				);
			}

			const orderToBeCancledIdx = activeBacktest.orders.indexOf(
				orderToBeCancled
			);

			const canceledOrder: Order = {
				...orderToBeCancled,
				status: "canceled"
			};

			let ordersCopy = [...activeBacktest.orders];

			ordersCopy[orderToBeCancledIdx] = canceledOrder;

			await collections.backtest.updateOne(activeBacktest._id, {
				$set: { orders: ordersCopy }
			});

			return canceledOrder;
		} catch (err) {
			throw err;
		}
	};

	return cancelOrder;
};

export default factory;
