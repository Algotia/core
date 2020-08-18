import { ConfigOptions, BootOptions } from "../../types";
import { Exchange } from "ccxt";
import { log, ccxt } from "../../utils";

const connectExchange = async (
	config: ConfigOptions,
	options?: BootOptions
): Promise<Exchange> => {
	try {
		const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
		const exchange: Exchange = new ccxt[exchangeId]({
			apiKey,
			secret: apiSecret,
			timeout
		});
		if (options) {
			options.verbose && log.info(`Created an instance of ${exchange.name}.`);
		}
		return exchange;
	} catch (err) {
		log.error(err);
	}
};

export default connectExchange;
