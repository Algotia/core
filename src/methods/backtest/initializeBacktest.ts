import { BacktestInput, BootData, BackfillDocument } from "../../types";
import { getBackfillCollection, encodeObject } from "../../utils";
import createBacktestingExchange from "./createExchange";
import { WithId } from "mongodb";

const initializeBacktest = async (
	bootData: BootData,
	backtestInput: BacktestInput
) => {
	try {
		const { mongoClient, redisClient, exchange } = bootData;
		const { backfillName, initialBalance } = backtestInput;
		const backfillCollection = await getBackfillCollection(mongoClient);

		const backfill: WithId<BackfillDocument> = await backfillCollection.findOne(
			{
				name: backfillName
			}
		);

		if (!backfill) {
			throw new Error(
				`Backfill ${backfillName} does not exist in the databse.`
			);
		}

		const startingBalance = {
			info: {
				free: initialBalance.quote,
				used: 0,
				total: initialBalance.quote
			},
			base: {
				free: initialBalance.base,
				used: 0,
				total: initialBalance.base
			},
			quote: {
				free: initialBalance.quote,
				used: 0,
				total: initialBalance.quote
			}
		};

		const encodedBalance = encodeObject(startingBalance);

		await redisClient.hmset("balance", {
			...encodedBalance
		});

		await redisClient.set("backfillName", backfillName);

		await redisClient.set("userCandleIdx", "0");
		await redisClient.set("internalCandleIdx", "0");

		const methodFactoryArgs = {
			exchange,
			redisClient,
			mongoClient
		};

		const backtestingExchange = await createBacktestingExchange(
			methodFactoryArgs
		);

		return {
			backfill,
			backtestingExchange
		};
	} catch (err) {
		throw err;
	}
};

export default initializeBacktest;
