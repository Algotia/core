import { Config, Algotia } from "../../types/methods/boot";
import bootDatabases from "./database";
import bootExhanges from "./exchanges";
import validateConfig from "./validate";

const boot = async <Conf extends Config>(
	config: Conf
): Promise<Algotia<Conf>> => {
	try {
		const { mongoClient, redisClient } = bootDatabases(config);
		const exchanges = bootExhanges(config);
		const quit = () => {
			mongoClient.close();
			redisClient.quit();
		};
		validateConfig(config);

		return {
			config,
			mongoClient,
			redisClient,
			exchanges,
			quit,
		};
	} catch (err) {
		throw err;
	}
};

export default boot;
