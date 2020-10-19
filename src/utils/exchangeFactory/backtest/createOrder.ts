import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";
import { Exchange as CcxtExchange, Params, Order } from "ccxt";
import { parsePair } from "../../general";
import { v4 as uuid } from "uuid";
import createFetchBalance from "./fetchBalance";
import {
	getCurrentPrice,
	getCurrentTime,
	pushOpenOrderId,
	setOrderHash,
	getBaseAndQuotePath,
} from "../../db";

type CreateCreateOrder = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => CcxtExchange["createOrder"];
const createCreateOrder: CreateCreateOrder = (algotia, options, exchange) => {
	return async function createOrder(
		pair: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number,
		params?: Params
	): Promise<Order> {
		try {
			const [base, quote] = parsePair(pair);

			const fetchBalance = createFetchBalance(algotia, options, exchange);
			const balance = await fetchBalance();

			if (type === "limit" && !price) {
				throw new Error("Cannot place limit order without price");
			}

			if (type === "market" && !price) {
				price = await getCurrentPrice(algotia, exchange.id, pair);
			}

			const cost = amount * price;

			if (side === "buy") {
				if (cost > balance[quote].free) {
					throw new Error(
						`Insufficent balance for order costing ${cost} -- ${balance[quote]}`
					);
				}
			}
			if (side === "sell") {
				if (cost > balance[base].free) {
					throw new Error(
						`Insufficent balance for order costing ${price} -- ${balance[base]}`
					);
				}
			}
			const currentTime = await getCurrentTime(algotia);
			const orderId = uuid();

			const order: Order = {
				symbol: pair,
				type,
				side,
				price,
				amount,
				id: orderId,
				datetime: new Date(currentTime).toISOString(),
				timestamp: currentTime,
				lastTradeTimestamp: null,
				status: "open",
				average: null,
				filled: 0,
				remaining: amount,
				cost: cost,
				trades: [],
				info: {},
				fee: {
					currency: quote,
					type: type === "market" ? "taker" : "maker",
					rate:
						type === "market"
							? exchange.fees["trading"]["taker"]
							: exchange.fees["trading"]["maker"],
					cost:
						type === "market"
							? exchange.fees["trading"]["taker"] * cost
							: exchange.fees["trading"]["taker"] * cost,
				},
			};
			const [baseBalancePath, quoteBalancePath] = getBaseAndQuotePath(
				exchange.id,
				pair
			);
			if (side === "buy") {
				await algotia.redis.hmset(quoteBalancePath, {
					free: Number(balance[quote].free) - Number(cost),
					used: Number(balance[quote].used) + Number(cost),
					total: Number(balance[quote].total),
				});
			}
			if (side === "sell") {
				await algotia.redis.hmset(baseBalancePath, {
					free: Number(balance[base].free) - Number(amount),
					used: Number(balance[base].used) + Number(amount),
					total: Number(balance[base].total),
				});
			}
			await setOrderHash(algotia, order);
			await pushOpenOrderId(algotia, exchange.id, orderId);

			return order;
		} catch (err) {
			throw err;
		}
	};
};

export default createCreateOrder;
