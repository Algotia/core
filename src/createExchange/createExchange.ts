import CCXT from "ccxt";
import { Exchange, ExchangeID } from "../types";

// Add custom properties to exchange
interface ExchangeModifications {
	OHLCVRecordLimit: number;
}

const modifications: Record<ExchangeID, ExchangeModifications> = {
	bitfinex: {
		OHLCVRecordLimit: 1000,
	},
	binance: {
		OHLCVRecordLimit: 1000,
	},
	kucoin: {
		OHLCVRecordLimit: 1500,
	},
};

/** Create an exchange instance. */
const createExchange = <ID extends ExchangeID>(id: ID): Exchange<ID> => {
	const ccxt = new CCXT[id]();

	const has: Exchange<ID>["has"] = {
		fetchStatus: ccxt.has["fetchStatus"],
		fetchOrderBook: ccxt.has["fetchOrderBook"],
		fetchOHLCV: ccxt.has["fetchOHLCV"],
		fetchBalance: ccxt.has["fetchBalance"],
		createOrder: ccxt.has["createOrder"],
		editOrder: ccxt.has["editOrder"],
		cancelOrder: ccxt.has["cancelOrder"],
		fetchOrder: ccxt.has["fetchOrder"],
		fetchOrders: ccxt.has["fetchOrders"],
		fetchOpenOrders: ccxt.has["fetchOpenOrders"],
		fetchClosedOrders: ccxt.has["fetchClosedOrders"],
		fetchMyTrades: ccxt.has["fetchMyTrades"],
		loadMarkets: ccxt.has["loadMarkets"],
	};

	const exchange: Exchange<ID> = {
		id,
		has,
		fees: ccxt.fees,
		markets: ccxt.markets,
		symbols: ccxt.symbols,
		timeframes: ccxt.timeframes,
		rateLimit: ccxt.rateLimit,
		OHLCVRecordLimit: modifications[id].OHLCVRecordLimit,
		fetchStatus: ccxt.fetchStatus.bind(ccxt),
		fetchOrderBook: ccxt.fetchOrderBook.bind(ccxt),
		fetchOHLCV: ccxt.fetchOHLCV.bind(ccxt),
		fetchBalance: ccxt.fetchBalance.bind(ccxt),
		createOrder: ccxt.createOrder.bind(ccxt),
		editOrder: ccxt.editOrder.bind(ccxt),
		cancelOrder: ccxt.cancelOrder.bind(ccxt),
		fetchOrder: ccxt.fetchOrder.bind(ccxt),
		fetchOrders: ccxt.fetchOrders.bind(ccxt),
		fetchOpenOrders: ccxt.fetchOpenOrders.bind(ccxt),
		fetchClosedOrders: ccxt.fetchClosedOrders.bind(ccxt),
		fetchMyTrades: ccxt.fetchMyTrades.bind(ccxt),
		loadMarkets: ccxt.loadMarkets.bind(ccxt),
	};

	return exchange;
};

export default createExchange;
