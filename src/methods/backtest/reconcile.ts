import { OHLCV, PartialOrder as POrder } from "../../types";
import { Tedis } from "tedis";
import { decodeObject, encodeObject } from "../../utils";
import { Trade, Order, Balances } from "ccxt";
import { v4 as uuid } from "uuid";

type IPartialOrder = Omit<POrder, "trades">;
type PartialTrade = Partial<Trade>;

interface PartialOrder extends IPartialOrder {
	trades: PartialTrade[];
}

let z = 0;

const fillOrder = async (
	order: PartialOrder,
	candle: OHLCV,
	redisClient: Tedis
) => {
	try {
		const { timestamp } = candle;
		const { id, price, type, amount, symbol, side } = order;
		const quoteCurrency = symbol.split("/")[1];

		let orderPrice: number;
		let orderCost: number;
		let takerOrMaker: "taker" | "maker";
		let feeRate: number;
		if (type === "market") {
			orderPrice = candle.open;
			orderCost = orderPrice * amount;
			takerOrMaker = "taker";
			feeRate = 0.001;
		} else {
			//TODO handle limit order
		}

		const orderId = `order:${id}`;

		const trade: PartialTrade = {
			id: uuid(),
			timestamp,
			datetime: new Date(timestamp).toISOString(),
			symbol,
			side,
			takerOrMaker,
			price: orderPrice,
			amount,
			cost: orderCost,
			fee: {
				cost: feeRate * orderCost,
				currency: quoteCurrency,
				type: takerOrMaker,
				rate: feeRate
			}
		};

		const filledOrder: PartialOrder = {
			...order,
			lastTradeTimestamp: timestamp,
			status: "closed",
			average: orderPrice,
			filled: amount,
			remaining: 0,
			cost: orderCost,
			trades: [trade],
			fee: {
				currency: quoteCurrency,
				type: takerOrMaker,
				cost: feeRate * orderCost,
				rate: feeRate
			}
		};

		const oldBalanceRaw = await redisClient.hgetall("balance");
		const oldBalance = decodeObject(oldBalanceRaw);
		const newBalance: Balances = {
			info: {
				free: oldBalance.info.total - orderCost,
				used: oldBalance.info.used,
				total: oldBalance.info.total - orderCost
			},
			quote: {
				free: oldBalance.quote.total - orderCost,
				used: oldBalance.quote.used,
				total: oldBalance.quote.total - orderCost
			},
			base: {
				free: oldBalance.base.total + amount,
				used: oldBalance.base.used,
				total: oldBalance.base.total + amount
			}
		};

		const encodedOrder = encodeObject(filledOrder);
		const encodedBalance = encodeObject(newBalance);

		await redisClient.hmset(orderId, {
			...encodedOrder
		});
		await redisClient.hmset("balance", {
			...encodedBalance
		});
		await redisClient.lrem("openOrders", -1, orderId);
	} catch (err) {
		throw err;
	}
};

const reconcile = async (candle: OHLCV, redisClient: Tedis) => {
	try {
		const openOrderIds = await redisClient.lrange("openOrders", 0, -1);

		for (let i = 0; i < openOrderIds.length; i++) {
			const orderId = openOrderIds[i];
			const thisOrderRaw = await redisClient.hgetall(orderId);
			const thisOrder = decodeObject(thisOrderRaw);

			await fillOrder(thisOrder, candle, redisClient);
		}

		//for (let i = 0; i < internalCandles.length; i++) {
		//const thisCandle = internalCandles[i];
		//const { open, high, low, timestamp } = thisCandle;

		//const openOrderIds = await redisClient.lrange("openOrders", 0, -1);
		//if (openOrderIds.length) {
		//openOrderIds.forEach(async (orderId: string) => {
		//const rawOrderHash = await redisClient.hgetall(orderId);
		//const orderHash: PartialOrder = decodeObject(rawOrderHash);
		//const { price, amount, side, type } = orderHash;

		////price checking
		//if (type === "market") {
		//await fillOrder(orderHash, thisCandle, redisClient);
		//}

		//if (side === "buy") {
		//}

		//if (side === "sell") {
		//}
		//await redisClient.lrem("openOrders", -1, orderId);
		//});
		//} else {
		//return;
		//}
		//await redisClient.incr("internalCandleIdx");
		//}
	} catch (err) {
		throw err;
	}
};

export default reconcile;
