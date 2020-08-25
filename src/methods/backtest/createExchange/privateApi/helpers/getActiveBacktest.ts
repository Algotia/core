import { WithId } from "mongodb";
import { ActiveBacktestDocument, Collections } from "../../../../../types";

const getActiveBacktest = async (
	collections: Collections
): Promise<WithId<ActiveBacktestDocument>> => {
	try {
		return await collections.backtest.findOne({ active: true });
	} catch (err) {
		throw err;
	}
};

export default getActiveBacktest;
