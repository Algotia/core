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
	isMulti,
	isSingle,
} from "../../types";
import {
	getDefaultExchange,
	backtestExchangeFactory,
	debugLog,
} from "../../utils";
import backfill from "./backfill";

const initializeBalance = async (
	algotia: AnyAlgotia,
	balance: SingleInitialBalance,
	exchangeId: ExchangeID
) => {
	try {
		const { redis } = algotia;
		for (const singleCurrency in balance) {
			const key = `${exchangeId}-balance:${singleCurrency}`;
			const singleBalance = {
				free: balance[singleCurrency],
				used: 0,
				total: balance[singleCurrency],
			};
			await redis.hmset(key, singleBalance);
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
		await redis.set(`current-price:${options.pair}`, candle.open);
	} catch (err) {
		throw err;
	}
};

const executeStrategy = async (
	strategy: SingleStrategy,
	exchange: BacktestingExchange,
	candle: OHLCV
): Promise<void> => {
	try {
		const promise = strategy(exchange, candle);
		if (
			promise &&
			typeof promise.then === "function" &&
			promise[Symbol.toStringTag] === "Promise"
		) {
			await Promise.resolve(promise);
		} else {
			return;
		}
	} catch (err) {
		throw err;
	}
};

async function backtest<
	Options extends SingleBacktestOptions | MultiBacktestOptions
>(algotia: AnyAlgotia, options: Options) {
	try {
		if (isSingle<SingleBacktestOptions>(options)) {
			const exchange = options.exchange
				? algotia.exchanges[options.exchange]
				: getDefaultExchange(algotia);
			const { initialBalance, strategy, ...backfillOptions } = options;
			const data = await backfill(algotia, backfillOptions);
			await initializeBalance(algotia, initialBalance, exchange.id);
			const backtestingExchange = backtestExchangeFactory(
				algotia,
				options,
				exchange
			);

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
			let strategyError = new StrategyError();
			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateContext(algotia, options, candle);
				try {
					await executeStrategy(strategy, backtestingExchange, candle);
				} catch (err) {
					strategyError.push(err.message);
				}
			}
			if (strategyError.messages.length) {
				throw `Strategy produced the following errors \n ${strategyError.messages}`;
			}
		}
	} catch (err) {
		throw err;
	}
}

export default backtest;
