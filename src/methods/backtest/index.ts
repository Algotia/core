import { BacktestInput, BootData } from "../../types/index";
import { getBackfillCollection, getBacktestCollection } from "../../utils";
import init from "./init/";

class InputError extends Error {}

const backtest = async (
	bootData: BootData,
	options: BacktestInput
): Promise<void> => {
	try {
		const { client } = bootData;
		const { backfillName, strategy } = options;

		const backfillCollection = await getBackfillCollection(client);
		const backtestCollection = await getBacktestCollection(client);

		const backfill = await backfillCollection.findOne({ name: backfillName });

		if (!backfill)
			throw new InputError(
				`Error while attempting to backtest: No backfill named ${backfillName}`
			);

		const initData = await init(bootData, options);
		const { exchange } = initData;

		const backfillLength = backfill.userCandles.length;

		let errors = [];
		try {
			for (let i = 0; i < backfillLength; i++) {
				try {
					await strategy(exchange, backfill.userCandles[i]);
					await backtestCollection.updateOne(
						{ active: true },
						{ $set: { userCandleIdx: i, internalCandleIdx: i } }
					);
				} catch (err) {
					errors.push(err);
				}
			}
		} finally {
			await backtestCollection.updateOne(
				{ active: true },
				{
					$unset: { active: null, userCandleIdx: null, internalCandleIdx: null }
				}
			);
		}

		return;
	} catch (err) {
		throw err;
	}
};

export default backtest;
