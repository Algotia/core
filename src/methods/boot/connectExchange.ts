import {
	SingleExchange,
	MultipleExchanges,
	AllowedExchangeId,
	Config,
	ExchangeObj
} from "../../types";
import { ccxt } from "../../utils";

const connectExchange = async (config: Config): Promise<ExchangeObj> => {
	try {
		const allConfigExchanges = Object.keys(config.exchange);
		let multipleExchanges: MultipleExchanges;

		const isAllowedId = (id: string): id is AllowedExchangeId => {
			return (id as AllowedExchangeId) !== undefined;
		};

		allConfigExchanges.forEach((id) => {
			if (isAllowedId(id)) {
				const exchange = ccxt[id];
				const { apiKey, apiSecret, timeout } = config.exchange[id];
				const singleExchange: SingleExchange = new exchange({
					apiKey,
					secret: apiSecret,
					timeout
				});
				multipleExchanges = {
					...multipleExchanges,
					[id]: singleExchange
				};
			}
		});
		return multipleExchanges;
	} catch (err) {
		throw err;
	}
};

export default connectExchange;
