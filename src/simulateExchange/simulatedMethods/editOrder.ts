import { Exchange as CCXT_Exchange, Order } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../types";
import { parsePair } from "../../utils";

type EditOrder = CCXT_Exchange["editOrder"];
type Fees = Exchange["fees"];

const createEditOrder = (
	store: SimulatedExchangeStore,
	fees: Fees
): EditOrder => async (
	id: string,
	symbol: string,
	type: "market" | "limit",
	side: "buy" | "sell",
	amount: number,
	price?: number
): Promise<Order> => {
	const foundOrder = store.openOrders.find((order) => {
		return order.id === id;
	});

	if (!foundOrder) {
		const wasIdClosedOrder = store.closedOrders.find((order) => {
			return order.id === id;
		});
		if (wasIdClosedOrder) {
			throw new Error(
				`Error editing order: Order with ID ${id} is already closed.`
			);
		}
		throw new Error(
			`Error editing order: No order with id ${id} was found.`
		);
	}

	const { currentTime, balance } = store;

	const [base, quote] = parsePair(symbol);

	let cost: number;

	if (type === "limit") {
		if (!price) {
			throw new Error(
				"Error editing order: Order type is limit, but no price passed - order not edited"
			);
		}
		cost = amount * price;
	}

	if (type === "market") {
		price = store.currentPrice;
		cost = amount * price;
	}

	const makerFee = fees["trading"]["maker"];
	const takerFee = fees["trading"]["taker"];

	const editedOrder: Order = {
		...foundOrder,
		id,
		symbol,
		type,
		side,
		amount,
		price,
		datetime: new Date(currentTime).toISOString(),
		timestamp: currentTime,
		lastTradeTimestamp: null,
		status: "open",
		average: null,
		filled: 0,
		remaining: amount,
		cost: cost + (type === "market" ? takerFee * cost : makerFee * cost),
		trades: [],
		info: {},
		fee: {
			currency: quote,
			type: type === "market" ? "taker" : "maker",
			rate: type === "market" ? takerFee : makerFee,
			cost: type === "market" ? takerFee * cost : makerFee * cost,
		},
	};

	const oldBaseBalance = store.balance[base];
	const oldQuoteBalance = store.balance[quote];

	if (side === "buy") {
		if (
			editedOrder.cost >
			oldQuoteBalance.free - (editedOrder.cost - foundOrder.cost)
		) {
			throw new Error(
				`Error editing order: Insufficient balance - order not edited`
			);
		}
	} else if (side === "sell") {
		if (cost > balance[base]["free"]) {
			throw new Error(
				`Error editing order: Insufficient balance - order not edited`
			);
		}
	}

	if (side === "buy") {
		store.balance = Object.assign(store.balance, {
			[quote]: {
				free:
					oldQuoteBalance.free -
					(editedOrder.cost - foundOrder.cost) -
					foundOrder.fee.cost,
				used:
					oldQuoteBalance.used + (editedOrder.cost - foundOrder.cost),
				total:
					oldQuoteBalance.total -
					(editedOrder.cost - foundOrder.cost) -
					foundOrder.fee.cost,
			},
		});
	}

	if (side === "sell") {
		store.balance = Object.assign(store.balance, {
			[base]: {
				free: oldBaseBalance.free - amount,
				used: oldBaseBalance.used + amount,
				total: oldBaseBalance.total,
			},
			[quote]: {
				free: oldQuoteBalance.free - editedOrder.fee.cost,
				used: oldQuoteBalance.used + editedOrder.fee.cost,
				total: oldQuoteBalance.total,
			},
		});
	}

	const index = store.openOrders.indexOf(foundOrder);

	store.openOrders.splice(index, 1);
	store.openOrders.push(editedOrder);

	return editedOrder;
};

export default createEditOrder;
