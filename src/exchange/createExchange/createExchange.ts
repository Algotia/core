import CCXT from "ccxt";
import { Exchange, ExchangeID } from "../../types";


// Add custom properties to exchange
interface ExchangeModifications {
	OHLCVRecordLimit: number;
}

const modifications: Record<ExchangeID, ExchangeModifications> = {
	bitfinex: {
		OHLCVRecordLimit: 1000
	},
	binance: {
		OHLCVRecordLimit: 1000,
	},
	kucoin: {
		OHLCVRecordLimit: 1500,
	},
};

/** Create an exchange instance. */
const createExchange = async (id: ExchangeID): Promise<Exchange> => {
	const ccxt = new CCXT[id]();

	const has: Exchange['has'] = {
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
		fetchMyTrades: ccxt.has["fetchMyTrades"]
	};

	const exchange: Exchange = {
		id,
		has,
		fees: ccxt.fees,
		rateLimit: ccxt.rateLimit,
		OHLCVRecordLimit: modifications[id].OHLCVRecordLimit,
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
		ccxt: ccxt,
	};

	await exchange.ccxt.loadMarkets()

	return exchange;
};

export default createExchange;
