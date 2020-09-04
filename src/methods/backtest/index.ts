import { BootData, BacktestInput, BacktestDocument } from "../../types";
import { decodeObject } from "../../utils";
import initializeBacktest from "./initializeBacktest";
import reconcile from "./reconcile";
import converPeriodToMs from "../../utils/time/convertPeriodToMs";
import saveBacktest from "./saveBacktest";

interface BacktestResults {
	backtest: BacktestDocument;
	errors: string[];
}
const backtest = async (
	bootData: BootData,
	backtestInput: BacktestInput
): Promise<BacktestResults> => {
	try {
		const { redisClient, mongoClient } = bootData;
		const { strategy } = backtestInput;
		const { backtestingExchange, backfill } = await initializeBacktest(
			bootData,
			backtestInput
		);

		const { period, userCandles, internalCandles } = backfill;

		const timesToReconcile = converPeriodToMs(period) / 60000;

		let strategyIndex = 0;
		let backtestErrors = [];
		for (let i = 0; i < internalCandles.length; i++) {
			const thisInternalCandle = internalCandles[i];
			if (i % timesToReconcile === 0) {
				try {
					await strategy(backtestingExchange, userCandles[strategyIndex]);
				} catch (err) {
					backtestErrors.push(`${err.message} at candle ${i}`);
				} finally {
					strategyIndex++;
					await redisClient.incr("userCandleIdx");
				}
			}
			await reconcile(thisInternalCandle, redisClient);
		}

		const endingBalanceRaw = await redisClient.hgetall("balance");
		const endingBalance = decodeObject(endingBalanceRaw);

		const allOrderIds = await redisClient.keys("order:*");
		const allOrders = await Promise.all(
			allOrderIds.map(async (orderId) => {
				const rawOrderHash = await redisClient.hgetall(orderId);
				const orderHash = decodeObject(rawOrderHash);
				return orderHash;
			})
		);

		const backtest = {
			backfillId: backfill._id,
			balance: endingBalance,
			orders: allOrders
		};

		const backtestDocument = await saveBacktest(backtest, mongoClient);
		await redisClient.command("FLUSHALL");

		return {
			backtest: backtestDocument,
			errors: backtestErrors
		};
	} catch (err) {
		throw err;
	}
};

export default backtest;
