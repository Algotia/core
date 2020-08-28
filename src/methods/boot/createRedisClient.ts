import { Tedis } from "tedis";

const createRedisClient = () => {
	const client = new Tedis();
	return client;
};

export default createRedisClient;
