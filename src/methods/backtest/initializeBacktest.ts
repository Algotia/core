import { BacktestInput, BootData, BackfillDocument } from "../../types";
import { getBackfillCollection, encodeObject } from "../../utils";
import createBacktestingExchange from "./createExchange";

const initializeBacktest = async (
	bootData: BootData,
	backtestInput: BacktestInput
) => {
	const { mongoClient, redisClient, exchange } = bootData;
	const { backfillName, initialBalance } = backtestInput;
	const backfillCollection = await getBackfillCollection(mongoClient);
	const backfill: BackfillDocument = await backfillCollection.findOne({
		name: backfillName
	});

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

	const backtestingExchange = await createBacktestingExchange(
		exchange,
		mongoClient,
		redisClient
	);

	return {
		backfill,
		backtestingExchange
	};
};

export default initializeBacktest;
