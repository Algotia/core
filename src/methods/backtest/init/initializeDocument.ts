import { RedisClient } from "redis";
import { Collection, ObjectId } from "mongodb";
import {
	ActiveBacktestDocument,
	ProcessedBacktestOptions,
	BaseAndQuoteCurrencies,
	BackfillDocument,
	BacktestInput
} from "../../../types";
import { Balances } from "ccxt";
import { Tedis } from "tedis";
import flatten from "flat";

const createBalance = (
	currencies: BaseAndQuoteCurrencies,
	balances: { base: number; quote: number }
): Balances => {
	const balance: Balances = {
		info: {
			free: balances.quote,
			used: 0,
			total: balances.quote
		},
		base: {
			free: balances.base,
			used: 0,
			total: balances.base
		},
		quote: {
			free: balances.quote,
			used: 0,
			total: balances.quote
		}
	};
	return balance;
};

const initializeDocument = async (
	options: { dataSet: BackfillDocument; options: BacktestInput },
	redisClient: Tedis
): Promise<void> => {
	const { pair } = options.dataSet;
	const { initialBalance } = options.options;
	const [base, quote] = pair.split("/");
	const baseAndQuote = {
		base,
		quote
	};

	const balance = createBalance(baseAndQuote, initialBalance);

	await redisClient.hmset("balance", {
		...flatten(balance)
	});

	await redisClient.set("internalCandleIdx", "0");
	await redisClient.set("userCandleIdx", "0");
	await redisClient.set("backfillId", options.options.backfillName);
};

export default initializeDocument;
