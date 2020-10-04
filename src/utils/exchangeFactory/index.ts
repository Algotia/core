import ccxt, { Params, OHLCV } from "ccxt";
import {
	ExchangeOptions,
	CcxtExchange,
	ExchangeID,
	ExchangeModifications,
	isExchangeID,
} from "../../types";

type Modifcations = {
	[key in ExchangeID]: {
		[Mod in keyof ExchangeModifications]: ExchangeModifications[Mod];
	};
};

const modifications: Modifcations = {
	binance: {
		OHLCVRecordLimit: 1000,
	},
	/* bitstamp: { */
	/* 	OHLCVRecordLimit: 1000, */
	/* }, */
	bittrex: {
		OHLCVRecordLimit: 960,
	},
	kucoin: {
		OHLCVRecordLimit: 1500,
	},
};

const exchangeFactory = (options: ExchangeOptions) => {
	const { id, ...restOfOptions } = options;
	if (isExchangeID(id)) {
		// We cast original to type CcxtExchange because we know the Id of exchange is allowed
		const original = new ccxt[id](restOfOptions) as CcxtExchange;
		const modified = Object.assign(original, modifications[id]);
		return modified;
	}
};

export default exchangeFactory;
