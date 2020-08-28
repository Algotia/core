import {
	MethodFactoryArgs,
	FetchBalance,
	InternalBalance
} from "../../../../../types";
import { unflatten } from "flat";
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
