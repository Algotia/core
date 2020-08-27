import { Balances, Order, Trade } from "ccxt";
import {
	Collections,
	ActiveBacktestDocumentWithId,
	BackfillDocument
} from "../../../types";
import { v4 as uuid } from "uuid";

interface FillOrderResults {
	orders: Order[];
	trades: Trade[];
	balance: Balances;
}

const fillOrder = async (order: Order, collections: Collections) => {
	try {
		//const thisBackfill: BackfillDocument = await collections.backfill.findOne(
		//activeBacktest.backfillId
		//);
		//const { pair } = thisBackfill;
		//const { balance, orders, trades, _id } = activeBacktest;
		//const [baseCurrency, quoteCurrency] = pair.split("/");
		//const freeQuoteCurrency = balance[quoteCurrency].free;
		//const usedQuoteCurrency = balance[quoteCurrency].used;
		//const totalQuoteCurency = balance[quoteCurrency].total;
		//const freeBaseCurrency = balance[baseCurrency].free;
		//const usedBaseCurrency = balance[baseCurrency].used;
		//const totalBaseCurrency = balance[baseCurrency].total;
		//const orderCost = order.cost;
		//const thisCandle =
		//thisBackfill.internalCandles[activeBacktest.internalCandleIdx];
		//const currentTime = thisCandle.timestamp;
		//const currentDatetime = new Date(currentTime).toISOString();
		//const addOrSubtractOrderCost = (target: number, reverse?: boolean) => {
		//if (order.side === "buy") {
		//if (!reverse) {
		//return target - orderCost;
		//} else {
		//return target + orderCost;
		//}
		//} else {
		//if (!reverse) {
		//return target + orderCost;
		//} else {
		//return target - orderCost;
		//}
		//}
		//};
		//const quoteCurrencyBalance = {
		//free: freeQuoteCurrency - orderCost,
		//used: usedQuoteCurrency - orderCost,
		//total: totalQuoteCurency - orderCost
		//};
		//const baseCurrencyBalance = {
		//free: freeBaseCurrency + order.amount,
		//used: usedBaseCurrency,
		//total: totalBaseCurrency + order.amount
		//};
		//const balanceAfterCost: Balances = {
		//info: {
		//...quoteCurrencyBalance
		//},
		//[quoteCurrency]: {
		//...quoteCurrencyBalance
		//},
		//[baseCurrency]: {
		//...baseCurrencyBalance
		//}
		//};
		//const trade: Trade = {
		//info: {},
		//id: uuid(),
		//timestamp: currentTime,
		//datetime: currentDatetime,
		//symbol: thisBackfill.pair,
		//order: order.id,
		//type: order.type === "market" ? "market" : "limit",
		//side: order.side,
		//takerOrMaker: order.type === "market" ? "taker" : "maker",
		//price: order.price,
		//amount: order.amount,
		//cost: order.price * order.amount,
		//fee: order.fee
		//};
		//const orderAfterFilled: Order = {
		//...order,
		//status: "closed",
		//filled: order.amount,
		//remaining: 0,
		//average: thisCandle.close,
		//trades: [...order.trades, trade]
		//};
		//collections.backtest.updateOne(
		//{ _id },
		//{
		//$set: {
		//balance: balanceAfterCost,
		//orders: [...orders, orderAfterFilled],
		//trades: [...trades, trade]
		//}
		//}
		//);
		//return {
		//balance: balanceAfterCost,
		//trades: [...trades, trade],
		//orders: [...orders, orderAfterFilled]
		//};
	} catch (err) {
		throw err;
	}
};

export default fillOrder;
