import { default as ccxtOriginal, Exchange } from "ccxt";
import { AllowedExchangeIds } from "../../types/";

type AllowedExchanges = {
	[key in AllowedExchangeIds]: typeof ccxtOriginal[key];
};

type CcxtOriginal = typeof ccxtOriginal;

type ExchangesArr = AllowedExchangeIds[];

interface Ccxt extends AllowedExchanges {
	exchanges: ExchangesArr;
}

type ModificationKey = {
	[key in AllowedExchangeIds]?: any;
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
		const { name, ...rest } = modification;
		for (const exchangeId in rest) {
			const exchange = allowedExchanges[exchangeId];
			exchange.prototype[name] = modification[exchangeId];
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

const createExchangesArr = (): ExchangesArr => {
	return Object.values(AllowedExchangeIds);
};

const wrapCcxt = (ccxtOriginal: CcxtOriginal): Ccxt => {
	const allowedExchanges = createExchangesArr();
	const extractedExchanges = extractAllowedExchanges(
		allowedExchanges,
		ccxtOriginal
	);
	const extendedExchanges = extendExchanges(extractedExchanges);

	return {
		exchanges: createExchangesArr(),
		...extendedExchanges
	};
};

const ccxt = wrapCcxt(ccxtOriginal);

export default ccxt;
