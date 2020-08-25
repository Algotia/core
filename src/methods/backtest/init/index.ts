import { WithId, ObjectId } from "mongodb";
import {
	BacktestInput,
	BackfillDocument as IBackfillDocument,
	BootData
} from "../../../types";
import { getBacktestCollection, getBackfillCollection } from "../../../utils";
import createBacktestingExchange from "../createExchange";
import processOptions from "./processOptions";
import initializeDocument from "./initializeDocument";

interface InitData {
	backtestId: ObjectId;
	//TODO: Create interface for exchange
	exchange: any;
}

type BackfillDocument = WithId<IBackfillDocument>;

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
