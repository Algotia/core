import { Trade } from "ccxt";
import { SimulatedExchangeStore, OHLCV, Order } from "../../../../types";
import { parsePair } from "../../../../utils";

const fillOrders = async (store: SimulatedExchangeStore, candle: OHLCV) => {
	try {
		for (const order of store.openOrders) {
			if (order.side === "buy") {
				if (order.price >= candle.low) {
					//fill order
					closeOrder(store, order);
				}
			}

			if (order.side === "sell") {
				if (order.price <= candle.high) {
					//fill order
					closeOrder(store, order);
				}
			}
		}
	} catch (err) {
		throw err;
	}
};


const createTrade = (store: SimulatedExchangeStore, order: Order): Trade => {
	const { currentTime } = store;

	const datetime = new Date(currentTime).toISOString();
	const timestamp = currentTime;

	const { id, symbol, side, amount, price, cost, fee, type } = order;

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
		...trade,
		info: trade,
	};
};

const closeOrder = (store: SimulatedExchangeStore, order: Order): Order => {
	const trade = createTrade(store, order);

	const index = store.openOrders.indexOf(order);

	const closedOrder: Order = {
		...order,
		status: "closed",
		filled: order.amount,
		average: order.price,
		remaining: 0,
		lastTradeTimestamp: trade.timestamp,
		trades: [trade],
	};

	closedOrder.info = { ...closedOrder };

	store.openOrders.splice(index, 1);
	store.closedOrders.push(closedOrder);

	updateBalance(store, closedOrder)

	return closedOrder;
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
				free: oldQuoteBalance.free + trade.cost - trade.fee.cost,
				used: oldQuoteBalance.used,
				total: oldQuoteBalance.total + trade.cost - trade.fee.cost,
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

export default fillOrders;
