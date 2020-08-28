import {
	MethodFactoryArgs,
	FetchOrders,
	PartialOrder
} from "../../../../../types";
import { unflatten } from "flat";

const factory = (args: MethodFactoryArgs): FetchOrders => {
	const { redisClient } = args;
	const fetchOrders: FetchOrders = async (
		symbol?: string,
		since?: number,
		limit?: number,
		params?: {}
	): Promise<PartialOrder[]> => {
		try {
			const orderIds = await redisClient.lrange("openOrders", 0, -1);

			const orderPromises: Promise<PartialOrder>[] = orderIds.map(
				async (orderId) => {
					const rawOrderHash = await redisClient.hgetall(orderId);
					const structuredOrder: PartialOrder = unflatten(rawOrderHash);
					return structuredOrder;
				}
			);

			return Promise.all(orderPromises);
		} catch (err) {
			throw err;
		}
	};
	return fetchOrders;
};

export default factory;
