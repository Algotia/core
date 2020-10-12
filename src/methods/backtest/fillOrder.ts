import { parsePair, debugLog, parseRedisFlatObj } from "../../utils";
import { Order, Trade } from "ccxt";
import { BacktestingExchange, AnyAlgotia, OHLCV } from "../../types";
import flatten from "flat";

const isMarketOrLimit = (type: any): type is "market" | "limit" => {
	if (type === "market" || "limit") {
		return true;
	}
};

const createTrade = async (
	algotia: AnyAlgotia,
	order: Order
): Promise<Trade> => {
	try {
		const timeStr = await algotia.redis.get("current-time");
		const date = new Date(Number(timeStr));
		const datetime = date.toISOString();
		const timestamp = date.getTime();
		const { id, symbol, side, amount, price, cost, fee } = order;

		let type: "market" | "limit";
		if (isMarketOrLimit(order.type)) {
			type = order.type;
		}
		const trade: Omit<Trade, "info"> = {
			id,
			symbol,
			side,
			amount,
			price,
			cost,
			datetime,
			timestamp,
			type,
			fee,
			takerOrMaker: fee.type,
		};

		return {
			info: { ...trade },
			...trade,
		};
	} catch (err) {
		throw err;
	}
};

const fillOpenOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	candle: OHLCV,
	order: Order
) => {
	try {
		const { redis } = algotia;

		const balance = await exchange.fetchBalance();

		const [base, quote] = parsePair(order.symbol);

		const basePath = `${exchange.id}-balance:${base}`;
		const quotePath = `${exchange.id}-balance:${quote}`;

		const closeOrder = async (order: Order) => {
			const openOrdersPath = `${exchange.id}-open-orders`;
			const closedOrdersPath = `${exchange.id}-closed-orders`;

			const trade = await createTrade(algotia, order);

			const currentTime = await redis.get("current-time");

			const orderModifications: Partial<Order> = {
				trades: [trade],
				average: order.price,
				filled: order.amount,
				remaining: 0,
				lastTradeTimestamp: Number(currentTime),
			};

			const flatModifications: Record<string, any> = flatten(
				orderModifications,
				{
					safe: true,
				}
			);

			await redis.hmset(order.id, flatModifications);

			await redis.lpush(closedOrdersPath, order.id);
			await redis.lrem(openOrdersPath, 0, order.id);
		};

		if (order.side === "buy") {
			if (order.price >= candle.low) {
				await redis.hmset(basePath, {
					free: balance[base].free + order.amount,
					used: balance[base].used,
					total: balance[base].total + order.amount,
				});

				await redis.hmset(quotePath, {
					free: balance[quote].free - order.fee.cost,
					used: balance[quote].used - order.cost,
					total: balance[quote].total - order.cost - order.fee.cost,
				});

				await closeOrder(order);
			}
		} else if (order.side === "sell") {
			if (order.price <= candle.high) {
				await redis.hmset(basePath, {
					free: balance[base].free,
					used: balance[base].used - order.amount,
					total: balance[base].total - order.amount,
				});

				await redis.hmset(quotePath, {
					free: balance[quote].free + order.cost - order.fee.cost,
					used: balance[quote].used,
					total: balance[quote].total + order.cost - order.fee.cost,
				});
				await closeOrder(order);
			}
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

		let openOrderIds = await redis.lrange(openOrdersPath, 0, -1);
		for (const orderId of openOrderIds) {
			let rawOpenOrder: any = await redis.hgetall(orderId);
			const openOrder = parseRedisFlatObj<Order>(rawOpenOrder);
			await fillOpenOrder(algotia, exchange, candle, openOrder);
		}
	} catch (err) {
		throw err;
	}
};

export default fillOrder;
