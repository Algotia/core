import { BacktestOtions, BootData } from "../../types/index";
import { log } from "../../utils";

const backtest = async (
	bootData: BootData,
	options: BacktestOtions
): Promise<void> => {
	try {
		const { db, client } = bootData;
		const { dataSet, strategy } = options;

		const backfillCollection = db.collection("backfill");
		const backfill = await backfillCollection.findOne({ name: dataSet });
		if (!backfill)
			throw `Error while attempting to backtest: No backfill named ${dataSet}`;

		const backfillLength = backfill.records.length;

		for (let i = 0; i < backfillLength; i++) {
			strategy(backfill.records[i]);
		}

		await client.close();
		return;
	} catch (err) {
		log.error(err);
	}
};

export default backtest;
