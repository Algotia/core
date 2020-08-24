import { ConfigOptions, AnyExchange } from "../../types";
import { ccxt } from "../../utils";

const connectExchange = async (config: ConfigOptions): Promise<AnyExchange> => {
	try {
		const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;

		const exchange = ccxt[exchangeId];

		const connected = new exchange({
			apiKey,
			secret: apiSecret,
			timeout
		});

		return connected;
	} catch (err) {
		throw err;
	}
};

export default connectExchange;
