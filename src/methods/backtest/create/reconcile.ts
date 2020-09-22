import { OHLCV } from "../../../types";
import { Tedis } from "tedis";
import { decodeObject } from "../../../utils";
import fillOrder from "./fillOrder";

const reconcile = async (candle: OHLCV, redisClient: Tedis) => {
	try {
		const openOrderIds = await redisClient.lrange("openOrders", 0, -1);

		for (let i = 0; i < openOrderIds.length; i++) {
			const orderId = openOrderIds[i];
			const thisOrderRaw = await redisClient.hgetall(orderId);
			const thisOrder = decodeObject(thisOrderRaw);

			const fillThisOrder = async () => {
				return await fillOrder(thisOrder, candle, redisClient);
			};

			// Fill market orders immediately
			if (thisOrder.type === "market") {
				await fillThisOrder();
			}

			// Check limit order prices
			if (thisOrder.type === "limit") {
				if (thisOrder.side === "buy") {
					if (thisOrder.price >= candle.low) {
						await fillThisOrder();
					}
				} else if (thisOrder.side === "sell") {
					if (thisOrder.price <= candle.high) {
						await fillThisOrder();
					}
				}
			}
		}
	} catch (err) {
		throw err;
	}
};

export default reconcile;
