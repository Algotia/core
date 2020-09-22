import {
	MethodFactoryArgs,
	PartialOrder,
	CreateOrder
} from "../../../../../types";
import { getThisCandle, getBackfillPair } from "../helpers/";
import fetchBalanceFactory from "./fetchBalance";
import { Order, Balances } from "ccxt";
import { v4 as uuid } from "uuid";
import { encodeObject, decodeObject } from "../../../../../utils";

class InsufficientBalanceError extends Error {
	constructor(balanceAmount: number, orderAmount: number, currency: string) {
		super(
			`Strategy attempted to place order for: ${orderAmount} ${currency} Available balance is: ${balanceAmount} ${currency}`
		);
		this.stack = null;
		this.name = "InsufficientBalanceError";
	}
}

const factory = (args: MethodFactoryArgs): CreateOrder => {
	const { redisClient } = args;
	const createOrder: CreateOrder = async (
		symbol: string,
		type: "limit" | "market",
		side: "buy" | "sell",
		amount: number,
		price?: number,
		params?: {
			clientOrderId: string;
		}
	): Promise<PartialOrder> => {
		const thisCandle = await getThisCandle(args);

		const [quoteCurrency] = await getBackfillPair(args);

		const fetchBalance = fetchBalanceFactory(args);
		const balance = await fetchBalance();

		const freeQuoteCurrency = balance.quote.free;

		let orderCost: number;

		if (price) {
			const cost = amount * price;
			orderCost = cost;
			if (cost > freeQuoteCurrency) {
				throw new InsufficientBalanceError(
					freeQuoteCurrency,
					orderCost,
					quoteCurrency
				);
			}
		} else {
			const cost = amount * thisCandle.close;
			orderCost = cost;
			if (cost > freeQuoteCurrency) {
				throw new InsufficientBalanceError(
					balance.quote.free,
					orderCost,
					quoteCurrency
				);
			}
		}

		if (!price) price = thisCandle.close;

		const maker = 0.0005;
		const taker = 0.001;

		const order: Partial<Order> = {
			id: uuid(),
			datetime: new Date(thisCandle.timestamp).toISOString(),
			timestamp: thisCandle.timestamp,
			lastTradeTimestamp: 0,
			status: "open",
			symbol,
			type,
			side,
			price: price,
			average: 0,
			amount: amount,
			// TODO: check if current candle price is greater than limit price
			// and if so fill the order completely
			filled: 0,
			remaining: amount,
			cost: orderCost,
			fee: {
				currency: quoteCurrency,
				cost:
					type === "market"
						? taker * (amount * price)
						: maker * (amount * price),
				rate: type === "market" ? taker : maker,
				type: type === "market" ? "taker" : "maker"
			}
		};

		const orderKey = `order:${order.id}`;

		const encodedOrder = encodeObject(order);

		await redisClient.hmset(orderKey, {
			...encodedOrder
		});

		await redisClient.rpush("openOrders", orderKey);

		const oldBalanceRaw = await redisClient.hgetall("balance");
		const oldBalance = decodeObject(oldBalanceRaw);
		let newBalance: Balances;
		if (side === "buy") {
			newBalance = {
				info: {
					free: oldBalance.info.total - orderCost,
					used: oldBalance.info.used - orderCost,
					total: oldBalance.info.total
				},
				quote: {
					free: oldBalance.quote.total - orderCost,
					used: oldBalance.quote.used - orderCost,
					total: oldBalance.quote.total
				},
				base: {
					free: oldBalance.base.total,
					used: oldBalance.base.used,
					total: oldBalance.base.total
				}
			};
		}
		const encodedBalance = encodeObject(newBalance);
		await redisClient.hmset("balance", encodedBalance);

		return order;
	};
	return createOrder;
};

export default factory;
