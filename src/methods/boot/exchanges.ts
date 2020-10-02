import { Config, AlgotiaExchanges } from "../../types/methods/boot";
import exchangeFactory from "../../utils/internal/exchangeFactory";
import { isExchangeID } from "../../types";

const isBooleanExchangeConfig = (obj: any): obj is boolean => {
	return typeof obj === "boolean";
};

const bootExhanges = <Conf extends Config>(config: Conf): AlgotiaExchanges => {
	const { exchange } = config;
	let exchanges: AlgotiaExchanges;
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
};

export default bootExhanges;
