import getDataSet from "./getDataSet";
import getActiveBacktest from "./getActiveBacktest";
import { ActiveBacktestDocument, Collections } from "../../../../../types";

const getThisCandle = async (collections: Collections) => {
	const dataSet = await getDataSet(collections);
	const thisBacktest: ActiveBacktestDocument = await getActiveBacktest(
		collections
	);

	const { userCandleIdx } = thisBacktest;
	const thisCandle = dataSet.userCandles[userCandleIdx];

	return thisCandle;
};

export default getThisCandle;
