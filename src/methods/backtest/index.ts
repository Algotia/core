import { BacktestOptions, BootData } from "../../types/index";
import { log, connectToDb } from "../../utils";

const backtest = async (
	bootData: BootData,
	options: BacktestOptions
): Promise<void> => {
	try {
		const { client } = bootData;
		const db = await connectToDb(client);
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
		await bootData.client.close();
		log.error(err);
	}
};

export default backtest;
