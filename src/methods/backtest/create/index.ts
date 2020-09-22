import {
	BootData,
	BacktestInput,
	SingleCandleSet,
	MultiCandleSets,
	OHLCV,
	BacktestResults,
	SingleInitData
} from "../../../types";
import { decodeObject } from "../../../utils";
import initializeBacktest from "./initializeBacktest";
import reconcile from "./reconcile";
import saveBacktest from "./saveBacktest";

const isSingleInitData = (initData: any): initData is SingleInitData => {
	return initData.exchange !== undefined;
};

const createBacktest = async (
	bootData: BootData,
	backtestInput: BacktestInput
): Promise<BacktestResults> => {
	try {
		const { redisClient, mongoClient } = bootData;
		const { strategy } = backtestInput;
		const initData = await initializeBacktest(bootData, backtestInput);

		let exchanges;
		let backfill;
		if (!isSingleInitData(initData)) {
			exchanges = initData.exchanges;
			backfill = initData.backfill;
		}

		let backtestErrors = [];
		for (let i = 0; i < backfill.candles.binance.length; i++) {
			const thisCandle = backfill.candles.binance[i];
			const allCandles = {
				binance: backfill.candles.binance[i],
				bitstamp: backfill.candles.bitstamp[i]
			};
			try {
				await strategy(exchanges, allCandles);
			} catch (err) {
				backtestErrors.push(`${err.message} at candle ${i}`);
			} finally {
				await redisClient.incr("userCandleIdx");
				await reconcile(thisCandle, redisClient);
			}
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

export default createBacktest;
