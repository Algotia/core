import { MethodFactoryArgs } from "../../../../../types";

const factory = (args: MethodFactoryArgs) => {
	const { redisClient } = args;
	const fetchBalance = async () => {
		const balance = await redisClient.hgetall("balance");
		return balance;
	};

	return fetchBalance;
};

export default factory;
