import CCXT from "ccxt";
import { Exchange, ExchangeID } from "../../../types";

interface ExchangeModifications {
	OHLCVRecordLimit: number;
}
const modifications: Record<ExchangeID, ExchangeModifications> = {
	binance: {
		OHLCVRecordLimit: 1000,
	},
	kucoin: {
		OHLCVRecordLimit: 1500,
	},
};

const createExchange = (id: ExchangeID): Exchange => {

	const ccxt = new CCXT[id]();

	const exchange: Exchange = {
		id,
		fees: ccxt.fees,
		rateLimit: ccxt.rateLimit,
		OHLCVRecordLimit: modifications[id].OHLCVRecordLimit,
		fetchOrderBook: ccxt.fetchOrderBook.bind(ccxt),
		fetchOHLCV: ccxt.fetchOHLCV.bind(ccxt),
		fetchBalance: ccxt.fetchBalance.bind(ccxt),
		createOrder: ccxt.createOrder.bind(ccxt),
		fetchOrder: ccxt.fetchOrder.bind(ccxt),
		fetchOrders: ccxt.fetchOrders.bind(ccxt),
		fetchOpenOrers: ccxt.fetchOpenOrders.bind(ccxt),
		fetchClosedOrders: ccxt.fetchClosedOrders.bind(ccxt),
		fetchMyTrades: ccxt.fetchMyTrades.bind(ccxt),
		ccxt: ccxt
	}

	return exchange;
};

export default createExchange;
