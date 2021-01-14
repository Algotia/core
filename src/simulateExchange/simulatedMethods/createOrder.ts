import { BadSymbol, InsufficientFunds, Order } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../types";
import { parsePair, uuid } from "../../utils";

type CreateOrder = Exchange["createOrder"];
type Fees = Exchange["fees"];

const createCreateOrder = (
	store: SimulatedExchangeStore,
	fees: Fees,
	derivesFrom?: Exchange
): CreateOrder => {
	return async (
		symbol: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number
	): Promise<Order> => {
		const { currentTime, balance } = store;

		const makerFee = fees["trading"]["maker"];
		const takerFee = fees["trading"]["taker"];

		const [base, quote] = parsePair(symbol);

		if (derivesFrom && derivesFrom.symbols) {
			if (!derivesFrom.symbols.includes(symbol)) {
				throw new BadSymbol(
					`Symbol ${symbol} does not exist on exchange ${derivesFrom.id}`
				);
			}
		} else {
			const balanceKeys = Object.keys(balance).filter(
				(key) => key !== "info" && key
			);

			if (!balanceKeys.includes(base)) {
				throw new BadSymbol(
					`No balance initialized for currency ${base}`
				);
			}

			if (!balanceKeys.includes(quote)) {
				throw new BadSymbol(
					`No balance initialized for currency ${quote}`
				);
			}
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

		const feeCost = costNoFee * (type === "market" ? takerFee : makerFee);
		const cost = side === "buy" ? costNoFee + feeCost : costNoFee - feeCost;

		const insufficientFundsMessage = `Insufficient ${type} ${side} balance for order costing ${cost} ${symbol}`;
		if (side === "buy") {
			if (cost > balance[quote]["free"]) {
				throw new InsufficientFunds(insufficientFundsMessage);
			}
		} else if (side === "sell") {
			if (cost > balance[base]["free"]) {
				throw new InsufficientFunds(insufficientFundsMessage);
			}
		}

		const order: Order = {
			clientOrderId: undefined,
			id: uuid(),
			symbol,
			type,
			side,
			amount,
			price,
			cost,
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
			delete store.balance.info.info;
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
			delete store.balance.info.info;
		}

		store.openOrders.push(order);

		return order;
	};
};

export default createCreateOrder;
