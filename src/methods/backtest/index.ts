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
} from "../../types";
import {
	getDefaultExchange,
	backtestExchangeFactory,
	debugLog,
} from "../../utils";
import backfill from "./backfill";
import fillOrder from "./fillOrder";

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
				`Initial balance: ${singleCurrency} - ${singleBalance}`
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
		err;
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

			debugLog(algotia, `Starting backtest`);
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

			let strategyError = new StrategyError();
			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateContext(algotia, options, candle);
				try {
					await executeStrategy(strategy, candle, backtestingExchange);
				} catch (err) {
					strategyError.push(err.message);
				}
				await fillOrder(algotia, backtestingExchange, candle);
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
