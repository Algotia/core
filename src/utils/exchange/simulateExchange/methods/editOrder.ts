import { Exchange as CCXT_Exchange } from "ccxt";
import {
	Exchange,
	Order,
	SimulatedExchangeStore,
} from "../../../../types";
import { parsePair } from "../../../general";

type EditOrder = CCXT_Exchange["editOrder"];

const createEditOrder = (
	store: SimulatedExchangeStore,
	exchange: Exchange
): EditOrder => {
	return async (
		id: string,
		symbol: string,
		type: "market" | "limit",
		side: "buy" | "sell",
		amount: number,
		price?: number
	): Promise<Order> => {
		try {
			const foundOrder = store.openOrders.find((order) => {
				return order.id === id;
			});

			if (!foundOrder) {
				const wasIdClosedOrder = store.closedOrders.find((order) => {
					return order.id === id;
				});
				if (wasIdClosedOrder) {
					throw new Error(
						`Error editing order: Order with ID ${id} is already closed.`
					);
				}
				throw new Error(
					`Error editing order: No order with id ${id} was found.`
				);
			}

			const { currentTime, balance } = store;

			const [base, quote] = parsePair(symbol);

			let cost: number;

			if (type === "limit") {
				if (!price) {
					throw new Error(
						"Error editing order: Order type is limit, but no price passed - order not edited"
					);
				}
				cost = amount * price;
			}

			if (type === "market") {
				price = store.currentPrice;
				cost = amount * price;
			}

			if (side === "buy") {
				if (cost > balance[quote]["free"]) {
					throw new Error(
						`Error editing order: Insufficient balance - order not edited`
					);
				}
			} else if ((side = "sell")) {
				if (cost > balance[base]["free"]) {
					throw new Error(
						`Error editing order: Insufficient balance - order not edited`
					);
				}
			}

			const makerFee = exchange.fees["trading"]["maker"];
			const takerFee = exchange.fees["trading"]["taker"];

			const editedOrder: Order = {
				...foundOrder,
				id,
				symbol,
				type,
				side,
				amount,
				price,
				datetime: new Date(currentTime).toISOString(),
				timestamp: currentTime,
				lastTradeTimestamp: null,
				status: "open",
				average: null,
				filled: 0,
				remaining: amount,
				cost:
					cost +
					(type === "market" ? takerFee * cost : makerFee * cost),
				trades: [],
				info: {},
				fee: {
					currency: quote,
					type: type === "market" ? "taker" : "maker",
					rate: type === "market" ? takerFee : makerFee,
					cost: type === "market" ? takerFee * cost : makerFee * cost,
				},
			};

			const oldBaseBalance = store.balance[base];
			const oldQuoteBalance = store.balance[quote];

			if (side === "buy") {
				store.balance = Object.assign(store.balance, {
					[quote]: {
						free:
							oldQuoteBalance.free -
							(cost + editedOrder.fee.cost),
						used:
							oldQuoteBalance.used +
							(cost + editedOrder.fee.cost),
						total: oldQuoteBalance.total,
					},
				});
			}

			if (side === "sell") {
				store.balance = Object.assign(store.balance, {
					[base]: {
						free: oldBaseBalance.free - amount,
						used: oldBaseBalance.used + amount,
						total: oldBaseBalance.total,
					},
					[quote]: {
						free: oldQuoteBalance.free - editedOrder.fee.cost,
						used: oldQuoteBalance.used + editedOrder.fee.cost,
						total: oldQuoteBalance.total,
					},
				});
			}

			const index = store.openOrders.indexOf(foundOrder);

			store.openOrders.splice(index, 1);
			store.openOrders.push(editedOrder);

			return editedOrder;
		} catch (err) {
			throw err;
		}
	};
};

export default createEditOrder
