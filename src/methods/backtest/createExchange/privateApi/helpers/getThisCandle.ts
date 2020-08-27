import getDataSet from "./getDataSet";
import getActiveBacktest from "./getActiveBacktest";
import {
	ActiveBacktestDocument,
	Collections,
	MethodFactoryArgs
} from "../../../../../types";

const getThisCandle = async (args: MethodFactoryArgs) => {
	const dataSet = await getDataSet(args);
	const userCandleIdx = await args.redisClient.get("userCandleIdx");
	const thisCandle = dataSet.userCandles[userCandleIdx];
	return thisCandle;
};

export default getThisCandle;
