import { BacktestInput, BootData } from "../../types/index";
import { getBackfillCollection, getBacktestCollection } from "../../utils";
import init from "./init/";
import reconcile from "./reconciler/";
import redis from "redis";
import { Tedis } from "tedis";

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
		const collections = {
			backfill: backfillCollection,
			backtest: backtestCollection
		};

		//const redisClient = redis.createClient();
		const redisClient = new Tedis();

		redisClient.on("error", (err) => {
			console.log("REDIS err - ", err);
		});
		const initData = await init(bootData, redisClient, options);
		const { exchange } = initData;

		const backfill = await backfillCollection.findOne({ name: backfillName });

		if (!backfill)
			throw new InputError(
				`Error while attempting to backtest: No backfill named ${backfillName}`
			);
		const userCandlesLength = backfill.userCandles.length;

		let errors = [];
		try {
			for (let i = 0; i < userCandlesLength; i++) {
				try {
					await strategy(exchange, backfill.userCandles[i]);
					await reconcile(collections);
				} catch (err) {
					errors.push(err);
				}
			}
		} catch (err) {
			if (errors.length) {
				console.log(errors);
			}
		} finally {
			redisClient.close();
		}
	} catch (err) {
		throw err;
	}
};

export default backtest;
