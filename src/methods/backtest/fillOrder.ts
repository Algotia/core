import {
	parsePair,
	debugLog,
	parseRedisFlatObj,
} from "../../utils";
import {
	getCurrentTime,
	getBaseAndQuotePath,
	pushClosedOrderId,
	removeOpenOrderId,
	getOpenOrderIds,
} from "./utils";
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
const closeOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	order: Order
) => {
	const { redis } = algotia;

	const trade = await createTrade(algotia, order);

	const currentTime = await getCurrentTime(algotia);

	const orderModifications: Partial<Order> = {
		trades: [trade],
		average: order.price,
		filled: order.amount,
		remaining: 0,
		lastTradeTimestamp: Number(currentTime),
	};

	const flatModifications: Record<string, any> = flatten(orderModifications, {
		safe: true,
	});

	await redis.hmset(order.id, flatModifications);

	await removeOpenOrderId(algotia, exchange.id, order.id);
	await pushClosedOrderId(algotia, exchange.id, order.id);
};

const fillOpenOrder = async (
	algotia: AnyAlgotia,
	exchange: BacktestingExchange,
	candle: OHLCV,
	order: Order
) => {
	try {
		const { redis } = algotia;

		// Balance before any orders are filled
		const balance = await exchange.fetchBalance();

		const [base, quote] = parsePair(order.symbol);

		const [basePath, quotePath] = getBaseAndQuotePath(
			exchange.id,
			order.symbol
		);

		if (order.side === "buy") {
			// Only fill if buy price is GTE lowest price of period
			if (order.price >= candle.low) {
				// Add base ammount to balance
				await redis.hmset(basePath, {
					free: balance[base].free + order.amount,
					used: balance[base].used,
					total: balance[base].total + order.amount,
				});

				// Subtract quote cost from used and total
				// and fee cost from free and total
				await redis.hmset(quotePath, {
					free: balance[quote].free - order.fee.cost,
					used: balance[quote].used - order.cost,
					total: balance[quote].total - order.cost - order.fee.cost,
				});

				await closeOrder(algotia, exchange, order);
			}
		} else if (order.side === "sell") {
			// Only fill if sell price is LTE highest price of period
			if (order.price <= candle.high) {
				// Subtract base ammount from used and total
				await redis.hmset(basePath, {
					free: balance[base].free,
					used: balance[base].used - order.amount,
					total: balance[base].total - order.amount,
				});

				// Add quote amount to free and total
				// Subtract fee cost from free and total
				await redis.hmset(quotePath, {
					free: balance[quote].free + order.cost - order.fee.cost,
					used: balance[quote].used,
					total: balance[quote].total + order.cost - order.fee.cost,
				});

				await closeOrder(algotia, exchange, order);
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

		let openOrderIds = await getOpenOrderIds(algotia, exchange.id);
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
