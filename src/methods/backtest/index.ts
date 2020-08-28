import { BootData, BacktestInput } from "../../types";
import { decodeObject } from "../../utils";
import initializeBacktest from "./initializeBacktest";
import reconcile from "./reconcile";
import converPeriodToMs from "../../utils/time/convertPeriodToMs";

const backtest = async (bootData: BootData, backtestInput: BacktestInput) => {
	try {
		const { redisClient } = bootData;
		const { strategy } = backtestInput;
		const { backtestingExchange, backfill } = await initializeBacktest(
			bootData,
			backtestInput
		);

		const { period, userCandles, internalCandles } = backfill;

		const timesToReconcile = converPeriodToMs(period) / 60000;

		let strategyIndex = 0;
		let strategyErrors = [];
		let j = 0;
		console.log(timesToReconcile);
		for (let i = 0; i < internalCandles.length; i++) {
			const thisInternalCandle = internalCandles[i];
			if (i % timesToReconcile === 0) {
				try {
					await strategy(backtestingExchange, userCandles[strategyIndex]);
				} catch (err) {
					strategyErrors.push(err.message);
				}
				strategyIndex++;
				await redisClient.incr("userCandleIdx");
			}
			await reconcile(thisInternalCandle, redisClient);
		}
		strategyErrors.forEach((errMessage) => {
			console.log(errMessage);
		});
		const endingBalanceRaw = await redisClient.hgetall("balance");
		const endingBalance = decodeObject(endingBalanceRaw);

		console.log("ENDING BALANCE - ", endingBalance);
	} catch (err) {
		throw err;
	}
};

export default backtest;
