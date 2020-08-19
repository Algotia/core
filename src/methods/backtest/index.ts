import { BacktestInput, BootData } from "../../types/index";
import { log, getBackfillCollection } from "../../utils";

class InputError extends Error {}

const backtest = async (
	bootData: BootData,
	options: BacktestInput
): Promise<void> => {
	try {
		const { client } = bootData;
		const { dataSet, strategy } = options;

		const backfillCollection = await getBackfillCollection(client);

		const backfill = await backfillCollection.findOne({ name: dataSet });

		if (!backfill)
			throw new InputError(
				`Error while attempting to backtest: No backfill named ${dataSet}`
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
