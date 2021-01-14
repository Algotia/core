import { Exchange as CCXT_Exchange, Params, Order } from "ccxt";
import { SimulatedExchangeStore } from "../../types";
import { parsePair } from "../../utils";

type CancelOrder = CCXT_Exchange["cancelOrder"];

const createCancelOrder = (store: SimulatedExchangeStore): CancelOrder => {
	return async (
		id: string,
		symbol?: string,
		params?: Params
	): Promise<Order> => {
		const order = store.openOrders.find((order) => {
			return order.id === id;
		});

		if (!order) {
			throw new Error(`No order with ID ${id} was found`);
		}

		const { side, amount, price, symbol: pair, fee } = order;

		const [base, quote] = parsePair(pair);

		const oldQuoteBalance = store.balance[quote];
		const oldBaseBalance = store.balance[base];

		const filledCost = price * amount;

		if (side === "buy") {
			store.balance[quote] = {
				free: oldQuoteBalance.free + filledCost - fee.cost,
				used: oldQuoteBalance.used - (filledCost + fee.cost),
				total: oldQuoteBalance.total - fee.cost,
			};
		}

		if (side === "sell") {
			store.balance[base] = {
				free: oldBaseBalance.free + amount,
				used: oldQuoteBalance.used - amount,
				total: oldQuoteBalance.total,
			};
			store.balance[quote] = {
				free: oldQuoteBalance.free - fee.cost,
				used: oldQuoteBalance.used,
				total: oldQuoteBalance.total - fee.cost,
			};
		}

		const index = store.openOrders.indexOf(order);

		store.openOrders.splice(index, 1);

		const closedOrder: Order = {
			...order,
			status: "canceled",
		};

		store.closedOrders.push(closedOrder);

		return closedOrder;
	};
};

export default createCancelOrder;
