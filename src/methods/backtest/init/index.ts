import { WithId, ObjectId } from "mongodb";
import {
	BacktestInput,
	BackfillDocument as IBackfillDocument,
	BootData
} from "../../../types";
import { getBacktestCollection, getBackfillCollection } from "../../../utils";
import createBacktestingExchange from "../createExchange";
import initializeDocument from "./initializeDocument";
import { Tedis } from "tedis";

interface InitData {
	//TODO: Create interface for exchange
	exchange: any;
}

type BackfillDocument = WithId<IBackfillDocument>;

const initializeBacktest = async (
	bootData: BootData,
	redisClient: Tedis,
	options: BacktestInput
): Promise<InitData> => {
	const { client, exchange } = bootData;

	const backfillCollection = await getBackfillCollection(client);

	const dataSet: BackfillDocument = await backfillCollection.findOne({
		name: options.backfillName
	});

	const processedOptions = {
		dataSet,
		options
	};

	initializeDocument(processedOptions, redisClient);

	const backtestExchange = await createBacktestingExchange(
		exchange,
		client,
		redisClient
	);

	return {
		exchange: backtestExchange
	};
};

export default initializeBacktest;
