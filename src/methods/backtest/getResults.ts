import {
	AnyAlgotia,
	BacktestingExchange,
	SingleBacktestResults,
	MultiBacktestResults,
	isExchangeRecord,
	ExchangeRecord,
} from "../../types";
import { parseRedisFlatObj } from "../../utils";
import { Order } from "ccxt";

type PartialSingleResults = Omit<SingleBacktestResults, "errors" | "options">;
type PartialMultiResults = Omit<MultiBacktestResults, "errors" | "options">;

async function getResults(
	algotia: AnyAlgotia,
	exchange: BacktestingExchange
): Promise<PartialSingleResults>;

async function getResults(
	algotia: AnyAlgotia,
	exchange: ExchangeRecord<BacktestingExchange>
): Promise<MultiBacktestResults>;

async function getResults(
	algotia: AnyAlgotia,
	exchange: BacktestingExchange | ExchangeRecord<BacktestingExchange>
): Promise<PartialSingleResults | PartialMultiResults> {
	const isMultiExchange = (
		exchange: BacktestingExchange | ExchangeRecord<BacktestingExchange>
	): exchange is ExchangeRecord<BacktestingExchange> => {
		return isExchangeRecord(exchange);
	};
	const isSingleExchange = (
		exchange: BacktestingExchange | ExchangeRecord<BacktestingExchange>
	): exchange is BacktestingExchange => {
		return !isExchangeRecord(exchange);
	};
	const getSigleExchangeResults = async (
		exchange: BacktestingExchange
	): Promise<PartialSingleResults> => {
		try {
			const { redis } = algotia;
			const getOrders = async (arr: string[]): Promise<Order[]> => {
				const promises = arr.map(
					async (id): Promise<Order> => {
						const rawOrder = await redis.hgetall(id);
						const order = parseRedisFlatObj<Order>(rawOrder);
						return order;
					}
				);
				return await Promise.all(promises);
			};

			const openOrderIds = await redis.lrange(
				`${exchange.id}-open-orders`,
				0,
				-1
			);

			const closedOrderIds = await redis.lrange(
				`${exchange.id}-closed-orders`,
				0,
				-1
			);

			const openOrders = await getOrders(openOrderIds);
			const closedOrders = await getOrders(closedOrderIds);
			const balance = await exchange.fetchBalance();

			return {
				balance,
				closedOrders,
				openOrders,
			};
		} catch (err) {
			throw err;
		}
	};
	if (isSingleExchange(exchange)) {
		return await getSigleExchangeResults(exchange);
	} else if (isMultiExchange(exchange)) {
		let results: PartialMultiResults;
		for (const exchangeId in exchange) {
			const singleResults = await getSigleExchangeResults(exchange[exchangeId]);
			for (const resultKey in singleResults) {
				results = {
					...results,
					[exchangeId]: {
						[resultKey]: singleResults[resultKey],
					},
				};
			}
		}
		return results;
	}
}

export default getResults;
