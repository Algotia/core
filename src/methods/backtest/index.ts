import { BacktestInput, BootData } from "../../types/index";
import { log, getBackfillCollection, getBacktestCollection } from "../../utils";
import createBacktestingExchange from "./createBacktestingExchange";

class InputError extends Error {}

const backtest = async (
	bootData: BootData,
	options: BacktestInput
): Promise<void> => {
	try {
		const { client, exchange } = bootData;

		const { documentName, strategy } = options;

		const backtestingExchange = createBacktestingExchange(exchange, client);

		const backfillCollection = await getBackfillCollection(client);
		const backtestCollection = await getBacktestCollection(client);

		const backfill = await backfillCollection.findOne({ name: documentName });

		if (!backfill)
			throw new InputError(
				`Error while attempting to backtest: No backfill named ${documentName}`
			);

		const backfillLength = backfill.records.length;

		for (let i = 0; i < backfillLength; i++) {
			strategy(backfill.records[i]);
		}

		return;
	} catch (err) {
		throw err;
	}
};

export default backtest;
