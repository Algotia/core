import { ConfigOptions } from "../../types";
import { Exchange } from "ccxt";
import { ccxt } from "../../utils";

const connectExchange = async (config: ConfigOptions): Promise<Exchange> => {
	try {
		const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
		return new ccxt[exchangeId]({
			apiKey,
			secret: apiSecret,
			timeout
		});
	} catch (err) {
		throw err;
	}
};

export default connectExchange;
