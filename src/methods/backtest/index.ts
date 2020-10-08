import { AnyAlgotia, ExchangeID, OHLCV } from "../../types";
import {
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleInitialBalance,
} from "../../types/methods/backtest";
import {
	getDefaultExchange,
	backtestExchangeFactory,
	parsePair,
} from "../../utils";
import backfill from "./backfill";

const isMultiOptions = (opts: any): opts is MultiBacktestOptions => {
	return opts.type === "multi";
};

const isSingleOptions = (opts: any): opts is SingleBacktestOptions => {
	return opts.type === "single" || undefined;
};

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

const updateCurrentPrice = async (
	algotia: AnyAlgotia,
	pair: string,
	candle: OHLCV
) => {
	try {
		const { redis } = algotia;
		await redis.set(`current-price:${pair}`, candle.open);
	} catch (err) {
		throw err;
	}
};

const validateOptions = (
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiBacktestOptions
) => {
	const configuredExchangeIDs = Object.keys(algotia.exchanges);

	if (isSingleOptions(options)) {
		if (options.exchange) {
			if (!configuredExchangeIDs.includes(options.exchange)) {
				throw new Error(`Exchange ${options.exchange} not configured`);
			}
		}
		//TODO: WAY BETTER VALIDATION
	}

	if (isMultiOptions(options)) {
	}
};

async function backtest<
	Options extends SingleBacktestOptions | MultiBacktestOptions
>(algotia: AnyAlgotia, options: Options) {
	try {
		if (isSingleOptions(options)) {
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

			for (let i = 0; i < data.length; i++) {
				const candle = data[i];
				await updateCurrentPrice(algotia, options.pair, candle);
				await algotia.redis.set("current-time", candle.timestamp);
				const possiblePromise = strategy(backtestingExchange, candle);
				if (
					possiblePromise &&
					typeof possiblePromise.then === "function" &&
					possiblePromise[Symbol.toStringTag] === "Promise"
				) {
					await Promise.resolve(possiblePromise);
				}
			}
		}
	} catch (err) {
		throw err;
	}
}

export default backtest;
