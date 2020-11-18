import { Trade, Order } from "ccxt";
import { SimulatedExchangeStore, OHLCV } from "../../../types";
import { parsePair } from "../../../utils";

const createFillOrders = (
	store: SimulatedExchangeStore
): ((candle: OHLCV) => void) => {
	return (candle: OHLCV) => {
		for (const order of store.openOrders) {
			if (order.type === "market") {
				closeOrder(store, order)
			} else if (order.type === "limit") {
				if (order.side === "buy") {
					if (order.price >= candle.low) {
						closeOrder(store, order);
					}
				}

				if (order.side === "sell") {
					if (order.price <= candle.high) {
						closeOrder(store, order);
					}
				}

			}
		}
	};
};

const closeOrder = (
	store: SimulatedExchangeStore,
	order: Order,
): Order => {

	const index = store.openOrders.indexOf(order);

	const trade = createTrade(store, order);

	let closedOrder: Order = {
		...order,
		status: "closed",
		filled: order.amount,
		average: order.price,
		remaining: 0,
		lastTradeTimestamp: trade.timestamp,
		trades: [trade],
	};

	closedOrder.info = {...closedOrder}


	store.openOrders.splice(index, 1);
	store.closedOrders.push(closedOrder);

	updateBalance(store, closedOrder);

	return closedOrder;
};

const createTrade = (store: SimulatedExchangeStore, order: Order, ): Trade => {
	const { currentTime } = store;

	const datetime = new Date(currentTime).toISOString();
	const timestamp = currentTime;

	const { id, symbol, side, amount, fee, cost, price, type } = order;

	const trade: Omit<Trade, "info"> = {
		id,
		symbol,
		side,
		amount,
		datetime,
		timestamp,
		type,
		fee,
		cost ,
		price ,
		takerOrMaker: fee.type,
	};

	return {
		...trade,
		info: trade,
	};
};

const updateBalance = (store: SimulatedExchangeStore, closedOrder: Order) => {
	for (const trade of closedOrder.trades) {
		const [base, quote] = parsePair(trade.symbol);

		const oldBaseBalance = store.balance[base];
		const oldQuoteBalance = store.balance[quote];

		if (trade.side === "buy") {
			const newBaseBalance = {
				free: oldBaseBalance.free + trade.amount,
				used: oldBaseBalance.used,
				total: oldBaseBalance.total + trade.amount,
			};

			const newQuoteBalance = {
				free: oldQuoteBalance.free,
				used: oldQuoteBalance.used - trade.cost,
				total: oldQuoteBalance.total - trade.cost,
			};

			const newBalance = Object.assign({}, store.balance, {
				[base]: newBaseBalance,
				[quote]: newQuoteBalance,
			});

			newBalance.info = { ...newBalance };

			store.balance = newBalance;
		}

		if (trade.side === "sell") {
			const newBaseBalance = {
				free: oldBaseBalance.free,
				used: oldBaseBalance.used - trade.amount,
				total: oldBaseBalance.total - trade.amount,
			};

			const newQuoteBalance = {
				free: oldQuoteBalance.free + trade.cost,
				used: oldQuoteBalance.used,
				total: oldQuoteBalance.total + trade.price,
			};

			const newBalance = Object.assign({}, store.balance, {
				[base]: newBaseBalance,
				[quote]: newQuoteBalance,
			});

			newBalance.info = { ...newBalance };

			store.balance = newBalance;
		}
	}
};

export default createFillOrders;
