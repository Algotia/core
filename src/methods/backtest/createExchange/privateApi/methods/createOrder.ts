import { MethodFactoryArgs } from "../../../../../types";
import { getThisCandle, getBackfillPair } from "../helpers/";
import fetchBalanceFactory from "./fetchBalance";
import { Balance, Order, Balances as CcxtBalances } from "ccxt";
import { v4 as uuid } from "uuid";
import flatten from "flat";

type CreateOrder = (
	symbol: string,
	side: "buy" | "sell",
	type: string,
	amount: number,
	price?: number,
	params?: {
		clientOrderId: string;
	}
) => Promise<Partial<Order>>;

const factory = (args: MethodFactoryArgs): CreateOrder => {
	const { collections, redisClient } = args;
	const createOrder: CreateOrder = async (
		symbol: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number,
		params?: {
			clientOrderId: string;
		}
	): Promise<Partial<Order>> => {
		try {
			const thisCandle = await getThisCandle(args);

			const [baseCurrency, quoteCurrency] = await getBackfillPair(args);

			const fetchBalance = fetchBalanceFactory(args);
			const balance = await fetchBalance();

			const freeQuoteCurrency = parseInt(balance["quote.free"]);

			let orderCost: number;

			if (price) {
				const cost = amount * price;
				orderCost = cost;
				if (cost > freeQuoteCurrency) {
					throw new Error(
						`Cannot place order for ${symbol} -- Avaialble balance is ${freeQuoteCurrency}, cost of order is ${cost}`
					);
				}
			} else {
				const cost = amount * thisCandle.close;
				orderCost = cost;
				if (cost > freeQuoteCurrency) {
					throw new Error(
						`Cannot place order for ${symbol} -- Avaialble balance is ${freeQuoteCurrency}, cost of order is ${cost}`
					);
				}
			}

			if (!price) price = thisCandle.close;

			//const markets = await args.exchange.loadMarkets();

			//const { maker, taker } = markets[symbol];
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
				price,
				average: 0,
				amount,
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

			console.log(flatten(order));
			await redisClient.hmset(orderKey, {
				...flatten(order)
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
