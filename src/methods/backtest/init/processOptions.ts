import { Collection, WithId, ObjectId } from "mongodb";
import {
	BacktestInput,
	BackfillDocument,
	BaseAndQuoteCurrencies
} from "../../../types";

interface ProcessedBacktestOptions extends BacktestInput {
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
	dataSet: WithId<BackfillDocument>,
	backtestCollection: Collection
): Promise<ProcessedBacktestOptions> => {
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

export default processOptions;
