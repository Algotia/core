import { AnyAlgotia, ExchangeID } from "../../../types";
import { Order } from "ccxt";
import flatten from "flat";

const getOpenOrdersPath = (id: string): string => {
	return `${id}-open-orders`;
};

const getClosedOrdersPath = (id: string): string => {
	return `${id}-closed-orders`;
};

const getOpenOrderIds = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID
): Promise<string[]> => {
	try {
		return await algotia.redis.lrange(getOpenOrdersPath(exchangeId), 0, -1);
	} catch (err) {
		throw err;
	}
};

const getClosedOrderIds = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID
): Promise<string[]> => {
	try {
		return await algotia.redis.lrange(getClosedOrdersPath(exchangeId), 0, -1);
	} catch (err) {
		throw err;
	}
};

const pushOpenOrderId = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID,
	orderId: string
): Promise<void> => {
	try {
		await algotia.redis.lpush(getOpenOrdersPath(exchangeId), orderId);
	} catch (err) {
		throw err;
	}
};

const removeOpenOrderId = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID,
	orderId: string
): Promise<void> => {
	try {
		await algotia.redis.lrem(getOpenOrdersPath(exchangeId), 1, orderId);
	} catch (err) {
		throw err;
	}
};

const pushClosedOrderId = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID,
	orderId: string
): Promise<void> => {
	try {
		await algotia.redis.lpush(getClosedOrdersPath(exchangeId), orderId);
	} catch (err) {
		throw err;
	}
};

const setOrderHash = async (
	algotia: AnyAlgotia,
	order: Order
): Promise<void> => {
	try {
		const flatOrder: Record<string, string | number> = flatten(order);
		await algotia.redis.hmset(order.id, flatOrder);
	} catch (err) {
		throw err;
	}
};

export {
	getOpenOrderIds,
	getClosedOrderIds,
	pushOpenOrderId,
	pushClosedOrderId,
	removeOpenOrderId,
	setOrderHash,
};
