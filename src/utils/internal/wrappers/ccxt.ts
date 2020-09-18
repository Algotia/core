import { default as ccxtOriginal } from "ccxt";
import { AllowedExchangeId, AllowedExchanges } from "../../../types/";

type ExtractedExhanges = {
	[key in AllowedExchangeId]: typeof ccxtOriginal[key];
};

interface ExtendedSingleExchange extends ccxtOriginal.Exchange {
	historicalRecordLimit: number;
	new (...args);
}

type ExtendedExchanges = {
	[key in AllowedExchangeId]: ExtendedSingleExchange;
};

type CcxtOriginal = typeof ccxtOriginal;

interface CcxtWrapped extends ExtendedExchanges {
	exchanges: typeof AllowedExchanges;
}

type ModificationKey = {
	[key in AllowedExchangeId]?: any;
};

interface Modification extends ModificationKey {
	name: string;
}

const extendExchanges = (
	extractedExchanges: ExtractedExhanges
): ExtendedExchanges => {
	// MODIFY THIS LIST TO EXTEND EXCHANGES
	// ------------------------
	const exchangeModifications: Modification[] = [
		{
			name: "historicalRecordLimit",
			binance: 1500,
			bitstamp: 1000
		}
	];
	// ----------------------
	let extendedExchanges: ExtendedExchanges;

	exchangeModifications.forEach((modification) => {
		const { name, ...exchanges } = modification;

		for (const id in exchanges) {
			if (exchanges.hasOwnProperty(id)) {
				// The exchange could already be modified, if so re-extend it
				const exchange =
					extendedExchanges && extendedExchanges[id]
						? extendedExchanges[id]
						: extractedExchanges[id];
				extendedExchanges = {
					...extendedExchanges,
					[id]: class extends exchange {
						constructor(...args: any) {
							super(args);
							this[name] = modification[id];
						}
					}
				};
			}
		}
	});

	return extendedExchanges;
};

const extractAllowedExchanges = (
	exchanges: typeof AllowedExchanges,
	ccxtOriginal: CcxtOriginal
): ExtractedExhanges => {
	const exchangeArr = exchanges.map((exchange) => {
		return { [exchange]: ccxtOriginal[exchange] };
	});

	return Object.assign({}, ...exchangeArr);
};

const wrapCcxt = (ccxtOriginal: CcxtOriginal): CcxtWrapped => {
	const extractedExchanges = extractAllowedExchanges(
		AllowedExchanges,
		ccxtOriginal
	);
	const extendedExchanges = extendExchanges(extractedExchanges);

	return {
		exchanges: AllowedExchanges,
		...extendedExchanges
	};
};

const ccxt = wrapCcxt(ccxtOriginal);

export default ccxt;
