import { BadRequest, BadSymbol, InsufficientFunds, Order } from "ccxt";
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

		if (type === "limit") {
			if (!price) {
				throw new BadRequest(
					"Order type is limit, but no price passed"
				);
			}
		}

		if (type === "market") {
			price = store.currentPrice;
		}

		const costNoFee = price * amount;
		const feeCost = costNoFee * (type === "market" ? takerFee : makerFee);
		const costWithFees = costNoFee + feeCost;

		const insufficientFundsMessage = `Insufficient balance for ${type} ${side} order costing ${
			side === "buy" ? costWithFees : amount
		} ${side === "buy" ? base : quote}`;

		if (side === "buy") {
			if (costNoFee > balance[quote]["free"]) {
				throw new InsufficientFunds(insufficientFundsMessage);
			}
			if (costWithFees > balance[quote]["free"]) {
				throw new InsufficientFunds(
					`Insufficient balance for paying fees costing ${feeCost} ${quote}`
				);
			}
		} else if (side === "sell") {
			if (amount > balance[base]["free"]) {
				throw new InsufficientFunds(insufficientFundsMessage);
			}
			if (feeCost > balance[quote]["free"]) {
				throw new InsufficientFunds(
					`Insufficient balance for paying fees costing ${feeCost} ${quote}`
				);
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
			cost: 0,
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
					free: oldQuoteBalance.free - costWithFees,
					used: oldQuoteBalance.used + costWithFees,
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
					free: oldQuoteBalance.free - feeCost,
					used: oldQuoteBalance.used + feeCost,
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
