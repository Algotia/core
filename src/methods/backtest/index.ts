import {
	AnyAlgotia,
	ExchangeID,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleInitialBalance,
	BacktestingExchange,
	SingleBacktestResults,
	MultiBacktestResults,
	isSingleBackfillOptions,
} from "../../types";
import {
	getDefaultExchange,
	simulatedExchangeFactory,
	debugLog,
} from "../../utils";
import backfill from "./backfill";
import getResults from "./getResults";
import {
	isMultiBacktestingOptions,
	isSingleBacktestingOptions,
} from "../../types/gaurds/isBacktestingOptions";
import executeStrategy from "./executeStrategy";

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

			const errors = await executeStrategy(
				algotia,
				options,
				backtestingExchange,
				data
			);

			// Get final balance and all orders
			const results = await getResults(algotia, backtestingExchange);
			return {
				...results,
				options,
				errors,
			};
		} else if (isMultiBacktestingOptions(options)) {
			// Multi backfill

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

			const errors = await executeStrategy(algotia, options, exchanges, data);

			// Get final balance and all orders
			const results = await getResults(algotia, exchanges);
			return {
				...results,
				options,
				errors,
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
