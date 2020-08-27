import { WithId } from "mongodb";
import {
	ActiveBacktestDocument,
	Collections,
	MethodFactoryArgs
} from "../../../../../types";

const getActiveBacktest = async (
	args: MethodFactoryArgs
): Promise<WithId<ActiveBacktestDocument>> => {
	try {
		const activeBacktest = await args.collections.backtest.findOne({
			active: true
		});
		return activeBacktest;
	} catch (err) {
		throw err;
	}
};

export default getActiveBacktest;
