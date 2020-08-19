import { ConfigOptions, BootData } from "../../types/";
import validateConfig from "./validateConfig";
import connectExchange from "./connectExchange";
import createClient from "./createClient";
import createEventBus from "./createEventBus";

const boot = async (configInput: ConfigOptions): Promise<BootData> => {
	try {
		const config = validateConfig(configInput);
		const exchange = await connectExchange(configInput);
		const client = await createClient(config);
		const eventBus = createEventBus();

		const bootData = {
			config,
			exchange,
			client,
			eventBus
		};

		return Object.assign({}, bootData);
	} catch (err) {
		throw err;
	}
};

export default boot;
