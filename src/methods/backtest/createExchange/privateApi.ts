import { MongoClient, Collection, ObjectId, WithId } from "mongodb";
import { getBacktestCollection, getBackfillCollection } from "../../../utils";
import { Order, Exchange, Params } from "ccxt";
import { v4 as uuid } from "uuid";
import { BackfillDocument, ActiveBacktestDocument } from "../../../types";

type FetchBalance = typeof Exchange.prototype.fetchBalance;
type CreateOrder = typeof Exchange.prototype.createOrder;
type CancelOrder = typeof Exchange.prototype.cancelOrder;
type FetchOrders = typeof Exchange.prototype.fetchOrders;

const createPrivateApis = async (
	exchange: Exchange,
	client: MongoClient
): Promise<{
	fetchBalance: FetchBalance;
	createOrder: CreateOrder;
	cancelOrder: CancelOrder;
	fetchOrders: FetchOrders;
}> => {
	try {
		// Helper functions
		const backfillCollection = await getBackfillCollection(client);
		const backtestCollection = await getBacktestCollection(client);

		const getActiveBacktest = async (
			backtestCollection: Collection
		): Promise<WithId<ActiveBacktestDocument>> => {
			try {
				return await backtestCollection.findOne({ active: true });
			} catch (err) {
				throw err;
			}
		};

		const getDataSet = async (): Promise<BackfillDocument> => {
			try {
				const thisBacktest: ActiveBacktestDocument = await getActiveBacktest(
					backtestCollection
				);
				const backfillId = thisBacktest.backfillId;

				return await backfillCollection.findOne(backfillId);
			} catch (err) {
				throw err;
			}
		};

		const currentCandleReducer = (currentCandle, thisCandle) => {
			if (!thisCandle.reconciled && !currentCandle) {
				currentCandle = thisCandle;
			}
		};
		// end helper functions

		// fetchBalance

		const fetchBalance: FetchBalance = async () => {
			const activeBackfill = await getActiveBacktest(backtestCollection);
			return activeBackfill.balance;
		};

		// End fetchBalance
		//
		// createOrder

		const createOrder: CreateOrder = async (
			symbol: string,
			side: "buy" | "sell",
			type: string,
			amount: number,
			price?: number,
			params?: {
				clientOrderId: string;
			}
		): Promise<Order> => {
			try {
				const dataSet = await getDataSet();
				const thisBacktest: ActiveBacktestDocument = await getActiveBacktest(
					backtestCollection
				);
				const { userCandleIdx } = thisBacktest;
				const thisCandle = dataSet.userCandles[userCandleIdx];

				const markets = await exchange.loadMarkets();

				const { maker, taker } = markets[symbol];

				const order: Order = {
					id: uuid(),
					datetime: new Date(thisCandle.timestamp).toISOString(),
					timestamp: thisCandle.timestamp,
					lastTradeTimestamp: undefined,
					status: "open",
					symbol,
					type,
					side,
					price,
					average: undefined,
					amount,
					// TODO: check if current candle price is greater than limit price
					// and if so fill the order completely
					filled: 0,
					remaining: amount,
					cost: 0,
					trades: [],
					fee: {
						currency: dataSet.pair.split("/")[1],
						cost: type === "market" ? taker * amount : maker * amount,
						rate: type === "market" ? taker : maker,
						type: type === "market" ? "taker" : "maker"
					},
					info: {}
				};

				const { _id, orders } = await getActiveBacktest(backtestCollection);

				const updatedOrders = orders ? [...orders, order] : [order];

				await backtestCollection.updateOne(
					{ _id },
					{
						$set: {
							orders: updatedOrders
						}
					}
				);

				return order;
			} catch (err) {
				throw err;
			}
		};

		// End createOrder
		//
		// canncelOrder

		const cancelOrder: CancelOrder = async (
			id: string,
			symbol?: string,
			params?: any
		): Promise<Order> => {
			try {
				const activeBacktest = await getActiveBacktest(backtestCollection);

				const orderToBeCancled: Order = activeBacktest.orders.find((order) => {
					return order.id === id;
				});

				if (!orderToBeCancled) {
					throw new Error(`Could not cancel order with the ID of ${id}`);
				}

				if (orderToBeCancled.symbol === symbol) {
					throw new Error(
						`Order with the id of ${id} does not have the symbol ${symbol}.`
					);
				}

				const orderToBeCancledIdx = activeBacktest.orders.indexOf(
					orderToBeCancled
				);

				const canceledOrder: Order = {
					...orderToBeCancled,
					status: "canceled"
				};

				let ordersCopy = [...activeBacktest.orders];

				ordersCopy[orderToBeCancledIdx] = canceledOrder;

				await backtestCollection.updateOne(activeBacktest._id, {
					$set: { orders: ordersCopy }
				});

				return canceledOrder;
			} catch (err) {
				throw err;
			}
		};

		// End canceledOrder
		//
		// fetchOrders

		const fetchOrders: FetchOrders = async (
			symbol?: string,
			since?: number,
			limit?: number,
			params?: Params
		): Promise<Order[]> => {
			try {
				const activeBacktest = await getActiveBacktest(backtestCollection);

				return activeBacktest.orders;
			} catch (err) {
				throw err;
			}
		};

		const privateApis = {
			fetchBalance,
			createOrder,
			cancelOrder,
			fetchOrders
		};

		return privateApis;
	} catch (err) {
		throw err;
	}
};

export default createPrivateApis;
