import { Exchange } from "ccxt";
import { log } from "../../utils/";
import { ConfigOptions, BootOptions, BootData } from "../../types/";

import validateConfig from "./validateConfig";
import connectExchange from "./connectExchange";
import createClient from "./createClient";
import createEventBus from "./createEventBus";

const boot = async (
	configInput: ConfigOptions,
	bootOptions?: BootOptions
): Promise<BootData> => {
	try {
		const config: ConfigOptions = validateConfig(configInput);
		const exchange: Exchange = await connectExchange(configInput, bootOptions);
		const client = await createClient(config);
		const eventBus = createEventBus();

		const bootData: BootData = {
			config,
			exchange,
			client,
			eventBus
		};

		return bootData;
	} catch (err) {
		log.error(err);
	}
};

export default boot;
