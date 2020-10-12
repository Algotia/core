import {
	AnyAlgotia,
	ExchangeID,
	OHLCV,
	BackfillOptions,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleInitialBalance,
	BacktestingExchange,
	SingleStrategy,
	isSingle,
	SingleBacktestResults,
	ProcessedBackfillOptions,
} from "../../types";
import {
	getDefaultExchange,
	backtestExchangeFactory,
	debugLog,
	parseRedisFlatObj,
} from "../../utils";
import backfill from "./backfill";
import fillOrder from "./fillOrder";
import { Order } from "ccxt";

class StrategyError extends Error {
	messages: string[];
	push: (err: string) => void;
	constructor() {
		super("Strategy Error");
		this.messages = [];
		this.push = (err) => {
			this.messages.push("\n" + err);
		};
	}
}
const initializeBacktest = async (
	algotia: AnyAlgotia,
	initialBalance: SingleInitialBalance,
	options: BackfillOptions,
	exchangeId: ExchangeID
): Promise<OHLCV[]> => {
	try {
		const { redis } = algotia;
		for (const singleCurrency in initialBalance) {
			const key = `${exchangeId}-balance:${singleCurrency}`;
			const singleBalance = {
				free: initialBalance[singleCurrency],
				used: 0,
				total: initialBalance[singleCurrency],
			};
			debugLog(
				algotia,
				`Initial balance: ${singleCurrency} - ${singleBalance}`,
				"info"
			);
			await redis.hmset(key, singleBalance);
		}

		const data = await backfill(algotia, options);
		return data;
	} catch (err) {
		throw err;
	}
};

const updateContext = async (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	candle: OHLCV
): Promise<void> => {
	try {
		const { redis } = algotia;
		await redis.set("current-time", candle.timestamp);
		await redis.set(`current-price:${options.pair}`, candle.close);
	} catch (err) {
		throw err;
	}
};

const executeStrategy = async (
	strategy: SingleStrategy,
	candle: OHLCV,
	exchange: BacktestingExchange
): Promise<void> => {
	try {
		const AsyncFunction = async function () {}.constructor;
		if (strategy instanceof AsyncFunction) {
			await strategy(exchange, candle);
		} else {
			strategy(exchange, candle);
		}
	} catch (err) {
		throw err;
	}
};

const getSingleResults = async (
	algotia: AnyAlgotia,
	options: SingleBacktestOptions,
	exchange: BacktestingExchange,
	strategyErrors: string[]
): Promise<SingleBacktestResults> => {
	try {
		const { redis } = algotia;
		const getOrders = async (arr: string[]) => {
			const promises = arr.map(
				async (id): Promise<Order> => {
					const rawOrder = await redis.hgetall(id);
					const order = parseRedisFlatObj<Order>(rawOrder);
					return order;
				}
			);
			return await Promise.all(promises);
		};

		const openOrderIds = await redis.lrange(
			`${exchange.id}-open-orders`,
			0,
			-1
		);

		const closedOrderIds = await redis.lrange(
			`${exchange.id}-closed-orders`,
			0,
			-1
		);

		const openOrders = await getOrders(openOrderIds);
		const closedOrders = await getOrders(closedOrderIds);
		const balance = await exchange.fetchBalance();
		const errors = strategyErrors;

		await redis.flushall();

		return {
			options,
			balance,
			closedOrders,
			openOrders,
			errors,
		};
	} catch (err) {
		throw err;
	}
};

async function backtest<
	Options extends SingleBacktestOptions | MultiBacktestOptions
>(algotia: AnyAlgotia, options: Options): Promise<SingleBacktestResults> {
	try {
		if (isSingle<SingleBacktestOptions>(options)) {
			const exchange = options.exchange
				? algotia.exchanges[options.exchange]
				: getDefaultExchange(algotia);

			const { initialBalance, strategy, ...backfillOptions } = options;

			debugLog(algotia, "Starting backtest");
			const data = await initializeBacktest(
				algotia,
				initialBalance,
				backfillOptions,
				exchange.id
			);

			const backtestingExchange = backtestExchangeFactory(
				algotia,
				options,
				exchange
			);

			let strategyErrors = [];
			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateContext(algotia, options, candle);
				try {
					await executeStrategy(strategy, candle, backtestingExchange);
				} catch (err) {
					strategyErrors.push(err.message);
				}
				await fillOrder(algotia, backtestingExchange, candle);
			}

			return await getSingleResults(
				algotia,
				options,
				backtestingExchange,
				strategyErrors
			);
		}
	} catch (err) {
		throw err;
	}
}

export default backtest;
