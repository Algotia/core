import { parsePair, debugLog } from "../../utils";
import { unflatten } from "flat";
import { Order } from "ccxt";
import { BacktestingExchange, AnyAlgotia, OHLCV } from "../../types";
import { inspect } from "util";

const fillBuyOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	candle: OHLCV,
	order: Order
) => {
	try {
		if (order.price >= candle.close) {
			const { redis } = algotia;
			const openOrdersPath = `${exchange.id}-open-orders`;
			const balance = await exchange.fetchBalance();
			const [base, quote] = parsePair(order.symbol);
			const basePath = `${exchange.id}-balance:${base}`;
			const quotePath = `${exchange.id}-balance:${quote}`;

			debugLog(
				algotia,
				`Balance before buy order fill ${inspect(balance.info)}`
			);

			await redis.hmset(basePath, {
				free: Number(balance[base].free) + Number(order.amount),
				used: Number(balance[base].used),
				total: Number(balance[base].total) + Number(order.amount),
			});

			await redis.hmset(quotePath, {
				free: Number(balance[quote].free),
				used: Number(balance[quote].used) - Number(order.cost),
				total: Number(balance[quote].total) - Number(order.cost),
			});

			await redis.lrem(openOrdersPath, 0, order.id);

			debugLog(
				algotia,
				`Bought ${order.amount} ${base} @ ${order.price} ${quote} (cost: ${order.cost} ${quote}) `
			);

			const newBalance = await exchange.fetchBalance();

			debugLog(
				algotia,
				`Balance after buy order fill ${inspect(newBalance.info)}`
			);
		}
	} catch (err) {
		throw err;
	}
};

const fillSellOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	candle: OHLCV,
	order: Order
) => {
	try {
		if (order.price <= candle.close) {
			const { redis } = algotia;
			const openOrdersPath = `${exchange.id}-open-orders`;
			const balance = await exchange.fetchBalance();
			const [base, quote] = parsePair(order.symbol);
			const basePath = `${exchange.id}-balance:${base}`;
			const quotePath = `${exchange.id}-balance:${quote}`;

			debugLog(algotia, `Balance before sell ${inspect(balance.info)}`);

			await redis.hmset(basePath, {
				free: Number(balance[base].free),
				used: Number(balance[base].used) - Number(order.amount),
				total: Number(balance[base].total) - Number(order.amount),
			});

			await redis.hmset(quotePath, {
				free: Number(balance[quote].free) + Number(order.cost),
				used: Number(balance[quote].used),
				total: Number(balance[quote].total) + Number(order.cost),
			});
			await redis.lrem(openOrdersPath, 0, order.id);

			debugLog(
				algotia,
				`Sold ${order.amount} ${base} @ ${order.price} ${quote} (cost: ${order.cost} ${quote}) `
			);

			const newBalance = await exchange.fetchBalance();

			debugLog(
				algotia,
				`Balance after sell order fill ${inspect(newBalance.info)}`
			);
		}
	} catch (err) {
		throw err;
	}
};

const fillOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	candle: OHLCV
): Promise<void> => {
	try {
		const { redis } = algotia;

		const openOrdersPath = `${exchange.id}-open-orders`;
		const openOrdersLen = await redis.llen(openOrdersPath);

		if (openOrdersLen !== 0) {
			let orderIds = await redis.lrange(openOrdersPath, 0, openOrdersLen);
			for (const orderId of orderIds) {
				let rawOrder: any = await redis.hgetall(orderId);
				for (const key in rawOrder) {
					const value = rawOrder[key];
					let res: string | number;
					if (isNaN(Number(value))) {
						res = value;
					} else {
						res = Number(value);
					}
					rawOrder[key] = res;
				}
				const order: Order = unflatten(rawOrder);
				if (order.side === "buy") {
					await fillBuyOrder(algotia, exchange, candle, order);
				}
				if (order.side === "sell") {
					await fillSellOrder(algotia, exchange, candle, order);
				}
			}
		}
	} catch (err) {
		throw err;
	}
};

export default fillOrder;
