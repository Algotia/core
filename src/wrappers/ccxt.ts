import ccxt from "ccxt";

const removeNonAllowedExchanges = (ccxt) => {
	const allowedExchanges = ["binance", "bitfinex"];

	ccxt.exchanges.forEach((exchange: string) => {
		if (!allowedExchanges.includes(exchange)) {
			delete ccxt[exchange];
		}
	});

	ccxt.exchange = allowedExchanges;

	return ccxt;
};

const applyRecordLimits = (ccxt) => {
	const recordLimits = {
		bitfinex: 10000,
		binance: 1000
	};

	const recordLimitKeys = Object.keys(recordLimits);

	recordLimitKeys.forEach((exchange) => {
		ccxt[exchange].historicalRecordLimit = recordLimits[exchange];
	});

	return ccxt;
};

const createCcxtWrapper = (ccxt) => {
	const withAllowedExhanges = removeNonAllowedExchanges(ccxt);
	const withRecordLimits = applyRecordLimits(withAllowedExhanges);

	const ccxtWrapped = withRecordLimits;

	return ccxtWrapped;
};

export default createCcxtWrapper(ccxt);
