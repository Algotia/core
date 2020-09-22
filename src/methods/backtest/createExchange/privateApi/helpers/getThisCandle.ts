import getDataSet from "./getDataSet";
import { MethodFactoryArgs, OHLCV } from "../../../../../types";

const getThisCandle = async (args: MethodFactoryArgs): Promise<OHLCV> => {
	const dataSet = await getDataSet(args);
	const userCandleIdx = await args.redisClient.get("userCandleIdx");
	return dataSet.candles[userCandleIdx];
};

export default getThisCandle;
