import { Config, Algotia } from "../../types/methods/boot";
import bootDatabases from "./database";
import bootExhanges from "./exchanges";
import validateConfig from "./validate";
import { debugLog } from "../../utils";

const boot = async <Conf extends Config>(
	config: Conf
): Promise<Algotia<Conf>> => {
	try {
		debugLog(config, "Starting boot");

		validateConfig(config);

		const { mongo, mongoClient, redis } = await bootDatabases();

		const exchanges = bootExhanges(config);

		const quit = () => {
			if (mongoClient.isConnected()) {
				mongoClient.close();
			}
			redis.quit();
		};

		debugLog(
			config,
			{
				label: "boot returned: ",
				value: {
					config,
					mongo,
					redis,
					exchanges,
					quit,
				},
			},
			"return_value"
		);

		return {
			config,
			mongo,
			redis,
			exchanges,
			quit,
		};
	} catch (err) {
		throw err;
	}
};

export default boot;
