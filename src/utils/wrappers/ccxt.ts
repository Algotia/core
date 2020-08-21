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
	[key in AllowedExchangeIds]: any;
};

interface Modification extends ModificationKey {
	name: string;
}

const extendExchanges = (
	allowedExchanges: AllowedExchanges
): AllowedExchanges => {
	const modifications: Modification[] = [
		{
			name: "historicalRecordLimit",
			binance: 1500,
			bitfinex: 10000
		}
	];

	for (let exchangeId in allowedExchanges) {
		let exchange: Exchange = allowedExchanges[exchangeId];
		modifications.forEach((modification) => {
			const { name } = modification;
			exchange.prototype[name] = modification[exchangeId];
		});
	}

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
