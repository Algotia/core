import { exchangeFactory } from "../../utils/";
import { isExchangeID, Config, ExchangeRecord, Exchange } from "../../types";

const isBooleanExchangeConfig = (obj: any): obj is boolean => {
	return typeof obj === "boolean";
};

const bootExhanges = <Conf extends Config>(
	config: Conf
): ExchangeRecord<Exchange> => {
	try {
		const { exchange } = config;
		let exchanges: ExchangeRecord<Exchange>;
		for (const id in exchange) {
			if (isExchangeID(id)) {
				const exchangeConfig = exchange[id];
				if (isBooleanExchangeConfig(exchangeConfig)) {
					exchanges = {
						...exchanges,
						[id]: exchangeFactory({ id }),
					};
				} else {
					exchanges = {
						...exchanges,
						[id]: exchangeFactory({ id, ...exchangeConfig }),
					};
				}
			}
		}
		return exchanges;
	} catch (err) {
		throw err;
	}
};

export default bootExhanges;
