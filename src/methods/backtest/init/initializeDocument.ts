import { Collection, ObjectId } from "mongodb";
import {
	ActiveBacktestDocument,
	ProcessedBacktestOptions,
	BaseAndQuoteCurrencies
} from "../../../types";
import { Balances } from "ccxt";

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
		[currencies.base]: {
			free: balances.base,
			used: 0,
			total: balances.base
		},
		[currencies.quote]: {
			free: balances.quote,
			used: 0,
			total: balances.quote
		}
	};
	return balance;
};

const initializeDocument = async (
	options: ProcessedBacktestOptions,
	backtestCollection: Collection
): Promise<ObjectId> => {
	const { name, backfillId, baseAndQuote, initialBalance } = options;
	const active = true;
	const balance = createBalance(baseAndQuote, initialBalance);

	const document: ActiveBacktestDocument = {
		name,
		backfillId,
		active,
		balance,
		orders: [],
		internalCandleIdx: 0,
		userCandleIdx: 0
	};

	const { insertedId } = await backtestCollection.insertOne(document);

	return insertedId;
};

export default initializeDocument;
