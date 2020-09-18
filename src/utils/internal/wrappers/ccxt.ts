import { default as ccxtOriginal } from "ccxt";
import { AllowedExchangeId, AllowedExchanges } from "../../../types/";

type AllowedExchanges = {
	[key in AllowedExchangeId]: typeof ccxtOriginal[key];
};

type CcxtOriginal = typeof ccxtOriginal;

type ExchangesArr = AllowedExchangeId[];

interface Ccxt extends AllowedExchanges {
	exchanges: ExchangesArr;
}

type ModificationKey = {
	[key in AllowedExchangeId]?: any;
};

interface Modification extends ModificationKey {
	name: string;
}

const exchangeModifications: Modification[] = [
	{
		name: "historicalRecordLimit",
		binance: 1500,
		//bitfinex: 10000
		bitstamp: 1000
	}
];

const extendExchanges = (
	allowedExchanges: AllowedExchanges
): AllowedExchanges => {
	exchangeModifications.forEach((modification) => {
		const { name, ...exchanges } = modification;
		for (const exchangeId in exchanges) {
			if (exchanges.hasOwnProperty(exchangeId)) {
				const exchange = allowedExchanges[exchangeId];
				exchange.prototype[name] = modification[exchangeId];
			}
		}
	});

	return allowedExchanges;
};

const extractAllowedExchanges = (
	exchanges: ExchangesArr,
	ccxtOriginal: CcxtOriginal
): AllowedExchanges => {
	const exchangeArr = exchanges.map((exchange) => {
		return { [exchange]: ccxtOriginal[exchange] };
	});

	return Object.assign({}, ...exchangeArr);
};

const wrapCcxt = (ccxtOriginal: CcxtOriginal): Ccxt => {
	const allowedExchanges = [...AllowedExchanges];
	const extractedExchanges = extractAllowedExchanges(
		allowedExchanges,
		ccxtOriginal
	);
	const extendedExchanges = extendExchanges(extractedExchanges);

	return {
		exchanges: allowedExchanges,
		...extendedExchanges
	};
};

const ccxt = wrapCcxt(ccxtOriginal);

export default ccxt;
