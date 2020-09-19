import {
	ExchangeObj,
	SingleExchange,
	ExchangeConfig,
	isAllowedExchangeId,
	ExchangeConfigError
} from "../../types";
import { ccxt } from "../../utils";
import { inspect } from "util";

const connectExchange = <T extends ExchangeConfig>(
	config: T
): ExchangeObj<T> => {
	try {
		let exchangeObj: ExchangeObj<T>;

		for (const id in config) {
			if (config.hasOwnProperty(id)) {
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
