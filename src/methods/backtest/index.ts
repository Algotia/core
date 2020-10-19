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
	ExchangeRecord,
	isExchangeID,
} from "../../types";
import {
	getDefaultExchange,
	backtestExchangeFactory,
	debugLog,
	parseRedisFlatObj,
	setCurrentTime,
	setCurrentPrice,
} from "../../utils";
import backfill from "./backfill";
import fillOrder from "./fillOrder";
import { Order } from "ccxt";
import {
	isMultiBacktestingOptions,
	isSingleBacktestingOptions,
} from "../../types/gaurds/isBacktestingOptions";
import { inspect } from "util";

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
	exchangeId: ExchangeID,
	candle: OHLCV
): Promise<void> => {
	try {
		const { redis } = algotia;
		await setCurrentTime(algotia, candle.timestamp);
		await setCurrentPrice(algotia, exchangeId, options.pair, candle.close);
	} catch (err) {
		throw err;
	}
};

const getSingleResults = async (
	algotia: AnyAlgotia,
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

		return {
			balance,
			closedOrders,
			openOrders,
		};
	} catch (err) {
		throw err;
	}
};

// backtest overloads
async function backtest<Opts extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<MultiBackfillResults>;

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
		await initializeBalances(algotia, options);

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

			const data = await backfill(algotia, options);

			let errors = [];
			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateContext(algotia, options, exchange.id, candle);
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

			const results = await getSingleResults(algotia, backtestingExchange);
			return {
				...results,
				errors,
				options,
			};
		} else if (isMultiBacktestingOptions(options)) {
			const exchanges: ExchangeRecord<BacktestingExchange> = {
				...options.exchanges
					.map((id) => {
						return {
							[id]: backtestExchangeFactory(
								algotia,
								options,
								algotia.exchanges[id]
							),
						};
					})
					.reduce((prev, next) => {
						return Object.assign({}, prev, next);
					}, {}),
			};

			const data = await backfill(algotia, options);

			let strategyErrors = [];

			const { strategy } = options;

			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				for (const exchangeId in candle) {
					await updateContext(
						algotia,
						options,
						exchanges[exchangeId].id,
						candle[exchangeId]
					);
				}
				try {
					if (strategy instanceof AsyncFunction) {
						await strategy(exchanges, candle);
					} else {
						strategy(exchanges, candle);
					}
				} catch (err) {
					strategyErrors.push(err);
				}

				for (const id in exchanges) {
					await fillOrder(algotia, exchanges[id], candle[id]);
				}
			}

			let results: MultiBackfillResults;
			for (const exchangeId in exchanges) {
				const singleResult = await getSingleResults(
					algotia,
					exchanges[exchangeId]
				);
				results = {
					...results,
					[exchangeId]: singleResult,
				};
			}

			return results;
		}
	} catch (err) {
		throw err;
	} finally {
		await algotia.redis.flushall();
	}
}

export default backtest;
