import {
	MethodFactoryArgs,
	PartialOrder,
	CreateOrder
} from "../../../../../types";
import { getThisCandle, getBackfillPair } from "../helpers/";
import fetchBalanceFactory from "./fetchBalance";
import { Order } from "ccxt";
import { v4 as uuid } from "uuid";
import chalk from "chalk";
import { encodeObject } from "../../../../../utils";

const red = chalk.underline.red;
const green = chalk.underline.green;
const yellow = chalk.bold.yellow;
class InsufficientBalanceError extends Error {
	constructor(balanceAmount: number, orderAmount: number, currency: string) {
		super(
			`Strategy attempted to place order for: \n ${red(orderAmount)} ${yellow(
				currency
			)} \n Available balance is:  \n ${green(balanceAmount)} ${yellow(
				currency
			)}`
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
		try {
			const thisCandle = await getThisCandle(args);

			const splitPair = await getBackfillPair(args);
			const quoteCurrency = splitPair[1];

			const fetchBalance = fetchBalanceFactory(args);
			const balance = await fetchBalance();

			const freeQuoteCurrency = balance.quote.free;

			let orderCost: number;

			if (price) {
				const cost = amount * price;
				orderCost = cost;
				if (cost > freeQuoteCurrency) {
					throw new InsufficientBalanceError(
						balance.quote.free,
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

			return order;
		} catch (err) {
			throw err;
		}
	};
	return createOrder;
};

export default factory;
