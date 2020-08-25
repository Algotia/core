import {
	Collections,
	createOrder,
	MethodFactoryArgs
} from "../../../../../types";
import { getThisCandle, getBackfillPair, getActiveBacktest } from "../helpers/";
import fetchBalanceFactory from "./fetchBalance";
import { Balance, Balances, Order } from "ccxt";
import { v4 as uuid } from "uuid";

const factory = (args: MethodFactoryArgs): createOrder => {
	const { collections, exchange } = args;
	const createOrder: createOrder = async (
		symbol: string,
		side: "buy" | "sell",
		type: string,
		amount: number,
		price?: number,
		params?: {
			clientOrderId: string;
		}
	): Promise<Order> => {
		try {
			const thisCandle = await getThisCandle(collections);

			const [baseCurrency, quoteCurrency] = await getBackfillPair(collections);

			const fetchBalance = fetchBalanceFactory(args);
			const balance = await fetchBalance();
			const quoteCurrencyBalance: Balance = balance[quoteCurrency];
			const freeQuoteCurrency = quoteCurrencyBalance.free;
			const usedQuoteCurrency = quoteCurrencyBalance.used;
			const totalQuoteCurency = quoteCurrencyBalance.total;

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

			let balanceCopy = { ...balance };
			const balanceAfterCost: Balances = {
				info: {
					free: freeQuoteCurrency - orderCost,
					used: usedQuoteCurrency + orderCost,
					total: totalQuoteCurency
				},
				[quoteCurrency]: {
					free: freeQuoteCurrency - orderCost,
					used: usedQuoteCurrency + orderCost,
					total: totalQuoteCurency
				},
				[baseCurrency]: balanceCopy[baseCurrency]
			};

			//const balanceAfterCost: Balances = {
			//...balance,
			//info: {
			//free: freeQuoteCurrency - orderCost,
			//used: usedQuoteCurrency + orderCost,
			//total: totalQuoteCurency
			//},
			//[quoteCurrency]: {
			//free: freeQuoteCurrency - orderCost,
			//used: usedQuoteCurrency + orderCost,
			//total: totalQuoteCurency
			//}
			//};

			const markets = await exchange.loadMarkets();

			const { maker, taker } = markets[symbol];

			const order: Order = {
				id: uuid(),
				datetime: new Date(thisCandle.timestamp).toISOString(),
				timestamp: thisCandle.timestamp,
				lastTradeTimestamp: undefined,
				status: "open",
				symbol,
				type,
				side,
				price,
				average: undefined,
				amount,
				// TODO: check if current candle price is greater than limit price
				// and if so fill the order completely
				filled: 0,
				remaining: amount,
				cost: amount * price,
				trades: [],
				fee: {
					currency: quoteCurrency,
					cost: type === "market" ? taker * amount : maker * amount,
					rate: type === "market" ? taker : maker,
					type: type === "market" ? "taker" : "maker"
				},
				info: {}
			};

			const { _id, orders } = await getActiveBacktest(collections);

			const updatedOrders = orders ? [...orders, order] : [order];

			await collections.backtest.updateOne(
				{ _id },
				{
					$set: {
						balance: balanceAfterCost,
						orders: updatedOrders
					}
				}
			);

			return order;
		} catch (err) {
			throw err;
		}
	};
	return createOrder;
};

export default factory;
