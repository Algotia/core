import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";
import { Exchange as CcxtExchange, Params, Order } from "ccxt";
import { parsePair } from "../../general";
import { v4 as uuid } from "uuid";
import { flatten } from "flat";
import createFetchBalance from "./fetchBalance";

type CreateCreateOrder = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => CcxtExchange["createOrder"];
const createCreateOrder: CreateCreateOrder = (algotia, options, exchange) => {
	return async function createOrder(
		symbol: string,
		type: string,
		side: "buy" | "sell",
		amount: number,
		price?: number,
		params?: Params
	): Promise<Order> {
		try {
			const [base, quote] = parsePair(symbol);

			const fetchBalance = createFetchBalance(algotia, options, exchange);
			const balance = await fetchBalance();

			if (type === "limit" && !price) {
				throw new Error("Cannot place limit order without price");
			}

			if (type === "market" && !price) {
				const priceString = await algotia.redis.get(`current-price:${symbol}`);
				price = Number(priceString);
			}

			const cost = amount * price;

			if (side === "buy") {
				if (cost > balance[quote].free) {
					throw new Error(
						`Insufficent balance for order costing ${price} -- ${balance[quote]}`
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
			const currentTime = await algotia.redis.get("current-time");
			const orderId = uuid();

			const order: Order = {
				symbol,
				type,
				side,
				price,
				amount,
				id: orderId,
				datetime: new Date(Number(currentTime)).toISOString(),
				timestamp: Number(currentTime),
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
			const flatOrder: any = flatten(order);
			const quoteBalancePath = `${exchange.id}-balance:${quote}`;
			const baseBalancePath = `${exchange.id}-balance:${base}`;
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
			await algotia.redis.hmset(orderId, flatOrder);
			await algotia.redis.lpush(`${exchange.id}-open-orders`, orderId);

			return order;
		} catch (err) {
			throw err;
		}
	};
};

export default createCreateOrder;
