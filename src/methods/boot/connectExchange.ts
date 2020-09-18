import { Config, ExchangeObj, SingleExchange } from "../../types";
import { ccxt } from "../../utils";

const connectExchange = async (config: Config): Promise<ExchangeObj> => {
	try {
		const allConfigExchanges = Object.keys(config.exchange);
		let exchangeObj: ExchangeObj;

		allConfigExchanges.forEach((id) => {
			const exchange = ccxt[id];
			const exchangCreds = config.exchange[id];

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
