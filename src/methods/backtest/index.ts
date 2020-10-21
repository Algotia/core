import {
	AnyAlgotia,
	ExchangeID,
	OHLCV,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleInitialBalance,
	BacktestingExchange,
	SingleBacktestResults,
	MultiBacktestResults,
	AsyncFunction,
	isSingleBackfillOptions,
	ExchangeError,
} from "../../types";
import {
	getDefaultExchange,
	simulatedExchangeFactory,
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
	options: SingleBacktestOptions | MultiBacktestOptions,
	exchangeId: ExchangeID,
	candle: OHLCV
): Promise<void> => {
	try {
		await setCurrentTime(algotia, candle.timestamp);
		await setCurrentPrice(algotia, exchangeId, options.pair, candle.open);
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

const getMultipleResults = async (
	algotia: AnyAlgotia,
	exchanges: Record<
		MultiBacktestOptions["exchanges"][number],
		BacktestingExchange
	>
): Promise<Omit<MultiBacktestResults, "errors" | "options">> => {
	try {
		let results: Omit<MultiBacktestResults, "errors" | "options">;
		for (const exchangeId in exchanges) {
			const singleResults = await getSingleResults(
				algotia,
				exchanges[exchangeId]
			);
			for (const resultKey in singleResults) {
				results = {
					...results,
					[resultKey]: {
						[exchangeId]: singleResults[resultKey],
					},
				};
			}
		}
		return results;
	} catch (err) {
		throw err;
	}
};

// backtest overloads
async function backtest(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions
): Promise<SingleBacktestResults>;

async function backtest<MultiOptions extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: MultiOptions
): Promise<MultiBacktestResults<MultiOptions>>;

// backtest
async function backtest<MultiOptions extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiOptions
): Promise<SingleBacktestResults | MultiBacktestResults<MultiOptions>> {
	try {
		// TODO: Validate

		// Store initial balances
		await initializeBalances(algotia, options);

		if (isSingleBacktestingOptions(options)) {
			// Single backfill
			const { strategy } = options;

			// If no exchange given use default exchange
			const exchange = options.exchange
				? algotia.exchanges[options.exchange]
				: getDefaultExchange(algotia);

			const backtestingExchange = simulatedExchangeFactory(
				algotia,
				options,
				exchange
			);

			const data = await backfill(algotia, options);

			let strategyErrors: string[] = [];

			const executeStrategy = async (candle: typeof data[number]) => {
				try {
					if (strategy instanceof AsyncFunction) {
						await strategy(backtestingExchange, candle);
					} else {
						strategy(backtestingExchange, candle);
					}
				} catch (err) {
					// Push errors to strategyErrors
					if (err instanceof ExchangeError) {
						strategyErrors.push(err.message);
					}
				}
			};

			for (let i = 0; i < data.length; i++) {
				const userCandle = data[i];
				const aheadCandle = data[i + 1];

				if (i === data.length - 1) {
					await executeStrategy(userCandle);
					break;
				}

				// Update time and current price
				await updateContext(algotia, options, exchange.id, aheadCandle);

				// Call strategy
				await executeStrategy(userCandle);

				// Attempt to fill any open orders
				await fillOrder(algotia, backtestingExchange, aheadCandle);
			}

			// Get final balance and all orders
			const results = await getSingleResults(algotia, backtestingExchange);
			return {
				...results,
				options,
				errors: strategyErrors,
			};
		} else if (isMultiBacktestingOptions(options)) {
			// Multi backfill

			//TODO: find a way not to cast here

			// Create object of backtestingExchanges from options.exchanges
			let exchanges: Record<
				MultiOptions["exchanges"][number],
				BacktestingExchange
			>;

			for (const id of options.exchanges) {
				exchanges = {
					...exchanges,
					[id]: simulatedExchangeFactory(
						algotia,
						options,
						algotia.exchanges[id]
					),
				};
			}

			const data = await backfill(algotia, options);

			const { strategy } = options;

			let strategyErrors: Record<MultiOptions["exchanges"][number], string[]>;

			const executeStrategy = async (userCandle: typeof data[number]) => {
				try {
					if (strategy instanceof AsyncFunction) {
						await strategy(exchanges, userCandle);
					} else {
						strategy(exchanges, userCandle);
					}
				} catch (err) {
					// Push errors to strategyErrors
					if (err instanceof ExchangeError) {
						const stratArr = strategyErrors[err.exchangeId];
						if (stratArr && stratArr[err.exchangeId]) {
							strategyErrors[err.exchangeId].push(err.message);
						} else {
							strategyErrors = Object.assign({}, strategyErrors, {
								[err.exchangeId]: err.message,
							});
						}
					}
				}
			};

			for (let i = 0; i < data.length; i++) {
				const userCandle = data[i];
				const aheadCandle = data[i + 1];

				if (i === data.length - 1) {
					await executeStrategy(userCandle);
					break;
				}

				for (const exchangeId in aheadCandle) {
					// Update time and current price
					await updateContext(
						algotia,
						options,
						exchanges[exchangeId].id,
						aheadCandle[exchangeId]
					);
				}
				// Call strategy
				await executeStrategy(userCandle);

				// Attempt to fill any open orders
				for (const id in exchanges) {
					await fillOrder(algotia, exchanges[id], aheadCandle[id]);
				}
			}

			// Get final balance and all orders
			const results = await getMultipleResults(algotia, exchanges);
			return {
				...results,
				options,
				errors: strategyErrors,
			};
		}
	} catch (err) {
		throw err;
	} finally {
		// No longer need data in redis.
		await algotia.redis.flushall();
	}
}

export default backtest;
