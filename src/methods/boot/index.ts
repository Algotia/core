import { Config, BootData } from "../../types/";
import validateConfig from "./validateConfig";
import connectExchange from "./connectExchange";
import createClient from "./createClient";
import createEventBus from "./createEventBus";
import createRedisClient from "./createRedisClient";

const boot = async <UserConfig extends Config>(
	configInput: UserConfig
): Promise<BootData<UserConfig>> => {
	try {
		const config = validateConfig(configInput);
		const exchange = connectExchange<UserConfig["exchange"]>(config.exchange);
		const mongoClient = await createClient(config);
		const eventBus = createEventBus();
		const redisClient = createRedisClient();

		const quit = () => {
			mongoClient.close();
			redisClient.close();
		};

		const bootData = {
			config,
			exchange,
			mongoClient,
			eventBus,
			redisClient,
			quit
		};

		return bootData;
	} catch (err) {
		throw err;
	}
};

export default boot;
