import {
	AnyAlgotia,
	ExchangeID,
	OHLCV,
	BackfillOptions,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleInitialBalance,
	BacktestingExchange,
	SingleBacktestResults,
	MultiBackfillResults,
	AsyncFunction,
	isSingleBackfillOptions,
	SingleBackfillSet,
	MultiBackfillSet,
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
import {
	isMultiBacktestingOptions,
	isSingleBacktestingOptions,
} from "../../types/gaurds/isBacktestingOptions";

const initializeBalances = async <
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(
	algotia: AnyAlgotia,
	options: Opts
) => {
	try {
		const { redis } = algotia;

		const initializeSingleBalance = async (
			initialBalance: SingleInitialBalance,
			exchangeId: ExchangeID
		): Promise<void> => {
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

		if (isMultiBacktestingOptions(options)) {
			const { exchanges, initialBalances } = options;
			for (const exchangeId of exchanges) {
				await initializeSingleBalance(initialBalances[exchangeId], exchangeId);
			}
			return await backfill(algotia, options);
		} else if (isSingleBackfillOptions(options)) {
			const exchangeId = options.exchange || getDefaultExchange(algotia).id;
			await initializeSingleBalance(options.initialBalance, exchangeId);
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
	options: SingleBacktestOptions | MultiBacktestOptions,
	exchange: BacktestingExchange
): Promise<Omit<SingleBacktestResults, "errors" | "options">> => {
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

		await redis.flushall();

		return {
			balance,
			closedOrders,
			openOrders,
		};
	} catch (err) {
		throw err;
	}
};

async function initialize<Opts extends SingleBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBackfillSet>;

async function initialize<Opts extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<MultiBackfillSet<Opts>>;

async function initialize<
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBackfillSet | MultiBackfillSet> {
	try {
		await initializeBalances(algotia, options);
		if (isSingleBacktestingOptions(options)) {
			return await backfill(algotia, options);
		} else if (isMultiBacktestingOptions(options)) {
			// TODO: find a way to avoid casting here
			return await backfill(algotia, options as MultiBacktestOptions);
		}
	} catch (err) {
		throw err;
	}
}

// backtest overloads
async function backtest<Opts extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<MultiBackfillResults<Opts["exchanges"]>>;

async function backtest<Opts extends SingleBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBacktestResults>;

// backtest
async function backtest<
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBacktestResults | MultiBackfillResults> {
	try {
		if (isSingleBacktestingOptions(options)) {
			const { strategy } = options;

			const exchange = options.exchange
				? algotia.exchanges[options.exchange]
				: getDefaultExchange(algotia);

			const backtestingExchange = backtestExchangeFactory(
				algotia,
				options,
				exchange
			);

			const data = await initialize(algotia, options);

			let errors = [];
			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateContext(algotia, options, candle);
				try {
					if (strategy instanceof AsyncFunction) {
						await strategy(backtestingExchange, candle);
					} else {
						strategy(backtestingExchange, candle);
					}
				} catch (err) {
					errors.push(err.message);
				}
				await fillOrder(algotia, backtestingExchange, candle);
			}

			const results = await getSingleResults(
				algotia,
				options,
				backtestingExchange
			);
			return {
				...results,
				errors,
				options,
			};
		} else if (isMultiBacktestingOptions(options)) {
			const data = await initialize<MultiBacktestOptions>(algotia, options);

			let exchanges: Record<
				typeof options["exchanges"][number],
				BacktestingExchange
			>;
			for (const id of options.exchanges) {
				await initializeBalances(algotia, options);
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
			}
			//TODO: MULTI BACKTEST
		}
	} catch (err) {
		throw err;
	}
}

export default backtest;
