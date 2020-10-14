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
	MultiInitialBalance,
	isMulti,
	MultiBackfillResults,
	SingleBackfillSet,
	MultiBackfillSet,
	MultiStrategy,
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

const initializeBacktest = async <
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(
	algotia: AnyAlgotia,
	options: Opts
) => {
	try {
		const initializeSingle = async (
			initialBalance: SingleInitialBalance,
			exchangeId: ExchangeID
		): Promise<void> => {
			const { redis } = algotia;
			for (const singleCurrency in initialBalance) {
				const key = `${exchangeId}-balance:${singleCurrency}`;
				const singleBalance = {
					free: initialBalance[singleCurrency],
					used: 0,
					total: initialBalance[singleCurrency],
				};
				debugLog(
					`Initial balance: ${singleCurrency} - ${singleBalance}`,
					"info"
				);
				await redis.hmset(key, singleBalance);
			}
		};
		if (isMulti<MultiBacktestOptions>(options)) {
			for (const id of options.exchanges) {
				await initializeSingle(options.initialBalances[id], id);
			}
			return await backfill(algotia, options);
		} else if (isSingle<SingleBacktestOptions>(options)) {
			const exchange = getDefaultExchange(algotia);
			await initializeSingle(options.initialBalance, exchange.id);
		}
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

async function backtest<Opts extends SingleBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBacktestResults>;

async function backtest<Opts extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<MultiBackfillResults<Opts["exchanges"]>>;

// Main backfill method
async function backtest<
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBacktestResults | MultiBackfillResults> {
	try {
		if (isSingle<SingleBacktestOptions>(options)) {
			const data = await backfill(algotia, options);

			const exchange = options.exchange
				? algotia.exchanges[options.exchange]
				: getDefaultExchange(algotia);

			const { strategy } = options;

			debugLog("Starting backtest");
			await initializeBacktest(algotia, options);

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
					const AsyncFunction = async function () {}.constructor;
					if (strategy instanceof AsyncFunction) {
						await strategy(backtestingExchange, candle);
					} else {
						strategy(backtestingExchange, candle);
					}
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
		} else if (isMulti<MultiBacktestOptions>(options)) {
			const data = await backfill(algotia, options);

			let exchanges: Record<ExchangeID, BacktestingExchange>;
			for (const id of options.exchanges) {
				await initializeBacktest(algotia, options);
				exchanges = Object.assign({}, exchanges, {
					[id]: backtestExchangeFactory(
						algotia,
						options,
						algotia.exchanges[id]
					),
				});
			}

			let strategyErrors = [];

			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				console.log(candle);
			}
			//TODO: MULTI BACKTEST
		}
	} catch (err) {
		throw err;
	}
}

export default backtest;
