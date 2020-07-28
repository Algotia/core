import ccxt from "ccxt";

const allowedExchanges = ["binance", "bitfinex"];

for (let key in ccxt) {
	if (ccxt.hasOwnProperty(key)) {
		if (ccxt.exchanges.includes(key)) {
			if (!allowedExchanges.includes(key)) {
				delete ccxt[key];
			}
		}
	}
}

const ccxtWrapper = {
	...ccxt,
	exchanges: allowedExchanges
};

export default ccxtWrapper;
