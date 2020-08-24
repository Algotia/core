import { MongoClient, Collection, WithId, ObjectId } from "mongodb";
import {
	BacktestInput,
	BackfillDocument as IBackfillDocument,
	ActiveBacktestDocument,
	AnyExchange,
	BootData
} from "../../types";
import { getBacktestCollection, getBackfillCollection } from "../../utils";
import { Balances } from "ccxt";
import createBacktestingExchange from "./createExchange";

interface InitData {
	backtestId: ObjectId;
	//TODO: Create interface for exchange
	exchange: any;
}

type BackfillDocument = WithId<IBackfillDocument>;
interface BaseAndQuoteCurrencies {
	base: string;
	quote: string;
}

interface ProcessedOptions extends BacktestInput {
	baseAndQuote: BaseAndQuoteCurrencies;
	backfillId: ObjectId;
	name: string;
}

const getBaseAndQuoteCurrencies = (pair: string): BaseAndQuoteCurrencies => {
	const [base, quote] = pair.split("/");
	return { base, quote };
};

const generateBacktestName = async (
	backtestCollection: Collection
): Promise<string> => {
	const docCount = await backtestCollection.countDocuments({});
	return `backtest-${docCount}`;
};

const processOptions = async (
	options: BacktestInput,
	dataSet: BackfillDocument,
	backtestCollection: Collection
): Promise<ProcessedOptions> => {
	const name = options.name || (await generateBacktestName(backtestCollection));
	const baseAndQuote = getBaseAndQuoteCurrencies(dataSet.pair);
	const backfillId = dataSet._id;

	const processedOptions = {
		name,
		baseAndQuote,
		backfillId
	};
	return {
		...options,
		...processedOptions
	};
};

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
	options: ProcessedOptions,
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

const initializeBacktest = async (
	bootData: BootData,
	options: BacktestInput
): Promise<InitData> => {
	const { client, exchange } = bootData;

	const backfillCollection = await getBackfillCollection(client);
	const backtestCollection = await getBacktestCollection(client);

	const dataSet: BackfillDocument = await backfillCollection.findOne({
		name: options.backfillName
	});

	const processedOptions = await processOptions(
		options,
		dataSet,
		backtestCollection
	);

	const backtestId = await initializeDocument(
		processedOptions,
		backtestCollection
	);

	const backtestExchange = await createBacktestingExchange(exchange, client);

	return {
		backtestId,
		exchange: backtestExchange
	};
};

export default initializeBacktest;
