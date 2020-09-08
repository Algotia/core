import { BootData, BacktestInput, BacktestDocument } from "../../types";
import { decodeObject } from "../../utils";
import initializeBacktest from "./initializeBacktest";
import reconcile from "./reconcile";
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

		const { candles } = backfill;

		let backtestErrors = [];
		for (let i = 0; i < candles.length; i++) {
			const thisCandle = candles[i];
			try {
				await strategy(backtestingExchange, thisCandle);
			} catch (err) {
				backtestErrors.push(`${err.message} at candle ${i}`);
			} finally {
				await redisClient.incr("userCandleIdx");
			}
			await reconcile(thisCandle, redisClient);
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
