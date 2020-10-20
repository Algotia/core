import {
	AnyAlgotia,
	BackfillOptions,
	Exchange,
	ExchangeError,
} from "../../../types";
import {
	parseRedisFlatObj,
	setOrderHash,
	removeOpenOrderId,
	pushClosedOrderId,
} from "../../db";
import { Order } from "ccxt";
import createFetchBalance from "./fetchBalance";
import { parsePair } from "../../general";

type CancelOrder = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => Exchange["cancelOrder"];

const createCancelOrder: CancelOrder = (algotia, options, exchange) => {
	return async function cancelOrder(id) {
		try {
			const { redis } = algotia;

			const rawOrder = await redis.hgetall(id);
			if (!rawOrder) {
				throw new ExchangeError(
					"Could not find an open order with the id " + id,
					id
				);
			}
			const order = parseRedisFlatObj<Order>(rawOrder);

			const canceledOrder: Order = {
				...order,
				status: "canceled",
			};

			const fetchBalance = createFetchBalance(algotia, options, exchange);
			const balance = await fetchBalance();
			const [base, quote] = parsePair(options.pair);

			if (order.side === "buy") {
				const quoteBalance = balance[quote];
				const quoteBalancePath = `${exchange.id}-balance:${quote}`;
				await redis.hmset(quoteBalancePath, {
					total: quoteBalance.total,
					used: quoteBalance.used - order.cost,
					free: quoteBalance.free + order.cost,
				});
			} else if (order.side === "sell") {
				const baseBalance = balance[base];
				const baseBalancePath = `${exchange.id}-balance:${base}`;
				await redis.hmset(baseBalancePath, {
					total: baseBalance.total,
					used: baseBalance.used - order.amount,
					free: baseBalance.free + order.amount,
				});
			}

			await setOrderHash(algotia, canceledOrder);
			await removeOpenOrderId(algotia, exchange.id, order.id);
			await pushClosedOrderId(algotia, exchange.id, order.id);

			return canceledOrder;
		} catch (err) {
			throw err;
		}
	};
};

export default createCancelOrder;
