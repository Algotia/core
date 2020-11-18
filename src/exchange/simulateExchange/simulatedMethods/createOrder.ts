import { Order } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../../types";
import { parsePair, uuid } from "../../../utils";

type CreateOrder = Exchange["createOrder"];

const createCreateOrder = (
	store: SimulatedExchangeStore,
	exchange: Exchange
): CreateOrder => {
	return async (
		symbol: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number
	): Promise<Order> => {
		const { currentTime, balance } = store;

		const makerFee = exchange.fees["trading"]["maker"];
		const takerFee = exchange.fees["trading"]["taker"];

		const [base, quote] = parsePair(symbol);

		const { symbols } = exchange.ccxt;

		if (!symbols.includes(symbol)) {
			throw new Error(`Symbol ${symbol} does not exist on exchange ${exchange.id}`)
		}

		let costNoFee: number;

		if (type === "limit") {
			if (!price) {
				throw new Error("Order type is limit, but no price passed");
			}
			costNoFee = amount * price;
		}

		if (type === "market") {
			price = store.currentPrice;
			costNoFee = amount * price;
		}

		const feeCost = costNoFee * (type === "market" ? takerFee : makerFee)
		const cost = side === "buy" ? costNoFee + feeCost : costNoFee - feeCost

		if (side === "buy") {
			if (cost > balance[quote]["free"]) {
				throw new Error(
					`Insufficient balance for order costing ${cost} ${symbol}`
				);
			}
		} else if ((side === "sell")) {
			if (cost > balance[base]["free"]) {
				throw new Error("Insufficient balance");
			}
		}

		const order: Order = {
			symbol,
			type,
			side,
			amount,
			price,
			cost,
			id: uuid(),
			datetime: new Date(currentTime).toISOString(),
			timestamp: currentTime,
			lastTradeTimestamp: null,
			status: "open",
			average: null,
			filled: 0,
			remaining: amount,
			trades: [],
			info: {},
			fee: {
				currency: quote,
				type: type === "market" ? "taker" : "maker",
				rate: type === "market" ? takerFee : makerFee,
				cost: feeCost,
			},
		};

		const oldBaseBalance = store.balance[base];
		const oldQuoteBalance = store.balance[quote];

		if (side === "buy") {
			store.balance = Object.assign(store.balance, {
				[quote]: {
					free: oldQuoteBalance.free - cost,
					used: oldQuoteBalance.used + cost,
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
					free: oldQuoteBalance.free,
					used: oldQuoteBalance.used,
					total: oldQuoteBalance.total,
				},
			});
			store.balance.info = { ...store.balance };
			delete store.balance.info.info
		}

		store.openOrders.push(order);

		return order;
	};
};

export default createCreateOrder;
