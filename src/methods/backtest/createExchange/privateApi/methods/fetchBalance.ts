import { MethodFactoryArgs, FetchBalance } from "../../../../../types";
import { Balances } from "ccxt";
import { decodeObject } from "../../../../../utils";

const factory = (args: MethodFactoryArgs): FetchBalance => {
	const { redisClient } = args;
	const fetchBalance: FetchBalance = async (): Promise<Balances> => {
		const rawBalance = await redisClient.hgetall("balance");
		const balance: Balances = decodeObject(rawBalance);
		return balance;
	};

	return fetchBalance;
};

export default factory;
