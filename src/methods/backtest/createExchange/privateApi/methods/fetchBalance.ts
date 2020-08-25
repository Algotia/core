import { getActiveBacktest } from "../helpers/";
import {
	Collections,
	fetchBalance,
	MethodFactoryArgs
} from "../../../../../types";

const factory = (args: MethodFactoryArgs): fetchBalance => {
	const { collections } = args;
	const fetchBalance: fetchBalance = async () => {
		const activeBackfill = await getActiveBacktest(collections);
		return activeBackfill.balance;
	};

	return fetchBalance;
};

export default factory;
