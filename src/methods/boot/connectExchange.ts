import {
	ExchangeObj,
	SingleExchange,
	isAllowedExchangeId,
	ExchangeConfigError,
	Config
} from "../../types";
import { ccxt } from "../../utils";

const connectExchange = <T extends Config["exchange"]>(
	config: T
): { [V in keyof T]: SingleExchange } => {
	try {
		let exchangeObj: ExchangeObj<T>;

		for (const id in config) {
			if (config.hasOwnProperty(id)) {
				//TODO: If user passes API Key/Secret, use
				//ccxt.checkRequiredCredentials
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
					if (exchangCreds === true) {
						singleExchange = new exchange();
					} else {
						break;
					}
				} else {
					singleExchange = new exchange(exchangCreds);
				}

				exchangeObj = {
					...exchangeObj,
					[id]: singleExchange
				};
			}
		}
		return exchangeObj;
	} catch (err) {
		throw err;
	}
};

export default connectExchange;
