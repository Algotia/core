import { Exchange, AnyAlgotia, BackfillOptions } from "../../types";
import { BacktestingExchange } from "../../types/methods/backtest";
import { Balances, Balance, Params, Order } from "ccxt";
import { v4 as uuid } from "uuid";
import { parsePair } from "../general";
import { flatten } from "flat";

const backtestExchangeFactory = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
): BacktestingExchange => {
	const fetchBalance: Exchange["fetchBalance"] = async function fetchBalance(
		params
	) {
		const splitPair = parsePair(options.pair);
		const balanceKeys = ["total", "used", "free"];

		let balance: Balances;
		for (const singleCurrency of splitPair) {
			const path = `${exchange.id}-balance:${singleCurrency}`;
			const balanceRaw = await algotia.redis.hgetall(path);
			let singleBalance: Balance;
			for (const key of balanceKeys) {
				singleBalance = {
					...singleBalance,
					[key]: balanceRaw[key],
				};
			}
			balance = {
				...balance,
				[singleCurrency]: singleBalance,
			};
		}
		balance.info = { ...balance };
		return balance;
	};

	async function createOrder(
		symbol: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number,
		params?: Params
	): Promise<Order> {
		try {
			const [base, quote] = parsePair(symbol);
			const balance = await fetchBalance();
			if (type === "limit" && !price) {
				throw new Error("Cannot place limit order without price");
			}
			if (type === "market" && !price) {
				const priceString = await algotia.redis.get(`current-price:${symbol}`);
				price = Number(priceString);
			}
			if (price > balance[quote].free) {
				throw new Error(
					`Insufficent balance for order costing ${price} -- ${balance[quote]}`
				);
			}
			const currentTime = await algotia.redis.get("current-time");

			const order: Order = {
				symbol,
				type,
				side,
				price,
				amount,
				id: uuid(),
				datetime: new Date(Number(currentTime)).toISOString(),
				timestamp: Number(currentTime),
				lastTradeTimestamp: null,
				status: "open",
				average: null,
				filled: 0,
				remaining: amount,
				cost: null,
				trades: [],
				info: {},
				fee: {
					currency: quote,
					type: type === "market" ? "taker" : "maker",
					rate:
						type === "market" ? exchange.fees["taker"] : exchange.fees["maker"],
					cost:
						type === "market"
							? exchange.fees["taker"] * amount
							: exchange.fees["taker"] * amount,
				},
			};
			const flatOrder: any = flatten(order);
			const orderId = `order-${uuid()}`;
			await algotia.redis.hmset(orderId, flatOrder);
			await algotia.redis.lpush("open-orders", orderId);

			return order;
		} catch (err) {
			throw err;
		}
	}

	const backtestingExchange: BacktestingExchange = {
		id: exchange.id,
		name: exchange.name,
		OHLCVRecordLimit: exchange.OHLCVRecordLimit,
		fees: exchange.fees,
		countries: exchange.countries,
		urls: exchange.urls,
		version: exchange.version,
		has: exchange.has,
		timeframes: exchange.timeframes,
		timeout: exchange.timeout,
		rateLimit: exchange.rateLimit,
		userAgent: exchange.userAgent,
		headers: exchange.headers,
		markets: exchange.markets,
		symbols: exchange.symbols,
		currencies: exchange.currencies,
		marketsById: exchange.marketsById,
		proxy: exchange.proxy,
		apiKey: exchange.apiKey,
		secret: exchange.secret,
		password: exchange.password,
		uid: exchange.uid,
		requiredCredentials: exchange.requiredCredentials,
		options: exchange.options,
		// PUBLIC API
		fetchMarkets: exchange.fetchMarkets,
		fetchCurrencies: exchange.fetchCurrencies,
		fetchTicker: exchange.fetchTicker,
		fetchOrderBook: exchange.fetchOrderBook,
		fetchTrades: exchange.fetchTrades,
		fetchOHLCV: exchange.fetchOHLCV,
		// PRIVATE API
		fetchBalance: fetchBalance,
		createOrder: createOrder.bind(this),
		cancelOrder: exchange.cancelOrder,
		editOrder: exchange.editOrder,
		fetchOrder: exchange.fetchOrder,
		fetchOpenOrders: exchange.fetchOpenOrders,
		fetchOrders: exchange.fetchOrders,
		fetchMyTrades: exchange.fetchMyTrades,
	};
	return backtestingExchange;
};

export default backtestExchangeFactory;
