import {
	ExchangeObj,
	SingleExchange,
	ExchangeConfig,
	isAllowedExchangeId,
	ConfigError,
	ExchangeConfigError
} from "../../types";
import { ccxt } from "../../utils";

const connectExchange = async (
	config: ExchangeConfig
): Promise<ExchangeObj> => {
	try {
		const allConfigExchanges = Object.keys(config);
		let exchangeObj: ExchangeObj;

		allConfigExchanges.forEach((id: string) => {
			if (!isAllowedExchangeId(id)) {
				throw new ExchangeConfigError(
					`${id} is not an allowed exchange ID`,
					"exchangeId",
					id
				);
			}
			const exchange = ccxt[id];
			const exchangCreds = config[id];

			let singleExchange: SingleExchange;
			if (typeof exchangCreds === "boolean") {
				if (exchangCreds) {
					singleExchange = new exchange();
				} else {
					return;
				}
			} else {
				singleExchange = new exchange(exchangCreds);
			}

			exchangeObj = {
				...exchangeObj,
				[id]: singleExchange
			};
		});

		return exchangeObj;
	} catch (err) {
		throw err;
	}
};

export default connectExchange;
