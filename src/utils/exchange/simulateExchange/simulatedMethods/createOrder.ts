import { Exchange, SimulatedExchangeStore, Order } from "../../../../types";
import { parsePair, uuid } from "../../../../utils";

type CreateOrder = Exchange["createOrder"];

const createCreateOrder = (
	store: SimulatedExchangeStore,
	exchange: Exchange
): CreateOrder => {
	return async (
		symbol: string,
		type: "market" | "limit",
		side: "buy" | "sell",
		amount: number,
		price?: number
	): Promise<Order> => {
		try {
			const { currentTime, balance } = store;

			const [base, quote] = parsePair(symbol);

			let cost: number;

			if (type === "limit") {
				if (!price) {
					throw new Error("Order type is limit, but no price passed");
				}
				cost = amount * price;
			}

			if (type === "market") {
				price = store.currentPrice;
				cost = amount * price;
			}

			if (side === "buy") {
				if (cost > balance[quote]["free"]) {
					throw new Error("Insufficient balance");
				}
			} else if ((side = "sell")) {
				if (cost > balance[base]["free"]) {
					throw new Error("Insufficient balance");
				}
			}

			const makerFee = exchange.fees["trading"]["maker"];
			const takerFee = exchange.fees["trading"]["taker"];

			const order: Order = {
				symbol,
				type,
				side,
				amount,
				price,
				id: uuid(),
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
						free: oldQuoteBalance.free - (cost + order.fee.cost),
						used: oldQuoteBalance.used + (cost + order.fee.cost),
						total: oldQuoteBalance.total,
					},
				});
				store.balance.info = { ...store.balance };
				delete store.balance.info.info
			}

			if (side === "sell") {
				store.balance = Object.assign(store.balance, {
					[base]: {
						free: oldBaseBalance.free - amount,
						used: oldBaseBalance.used + amount,
						total: oldBaseBalance.total,
					},
					[quote]: {
						free: oldQuoteBalance.free - order.fee.cost,
						used: oldQuoteBalance.used + order.fee.cost,
						total: oldQuoteBalance.total,
					},
				});
				store.balance.info = { ...store.balance };
				delete store.balance.info.info
			}

			store.openOrders.push(order);

			return order;
		} catch (err) {
			store.errors.push(err);
		}
	};
};

export default createCreateOrder;
