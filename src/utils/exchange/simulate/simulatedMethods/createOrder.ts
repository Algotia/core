import { Exchange, SimulatedExchangeStore } from "../../../../types"
import { Order } from "ccxt"
import { parsePair } from "../../../../utils"

type CreateOrder = Exchange["createOrder"]

const createCreateOrder = (
    store: SimulatedExchangeStore,
    exchange: Exchange
): CreateOrder => {
    return async (
        symbol: string,
        type: string,
        side: "buy" | "sell",
        amount: number,
        price?: number
    ): Promise<Order> => {
        try {

            const { currentTime, balance } = store

            const [base, quote] = parsePair(symbol);

            let cost: number;

            if (type === "limit") {
                if (!price) {
                    throw new Error("Order type is limit, but no price passed")
                }
				cost = amount * price;
            }

            if (type === "market") {
                price = store.currentPrice;
                cost = amount * price;
            }

			if ( side === "buy" ) {
					if (cost > balance[quote]["free"]) {
							throw new Error("Insufficient balance")
					}
			} else if ( side = "sell" ) {
					if ( cost > balance[base]["free"] ) {
						throw new Error("Insufficient balance")
					}
			}



            const order: Order = {
                symbol,
                type,
                side,
                amount,
                price,
                id: 'lol', //TODO: CREATE UUID
                datetime: new Date(currentTime).toISOString(),
                timestamp: currentTime,
                lastTradeTimestamp: null,
                status: "open",
                average: null,
                filled: 0,
                remaining: amount,
                cost,
                trades: [],
                info: {},
                fee: {
                    currency: quote,
                    type: type === "market" ? "maker" : "taker",
                    rate: type === "market" ?
                        exchange.fees["trading"]["taker"]
                        : exchange.fees["trading"]["maker"],
                    cost: type === "market" ?
                        exchange.fees["trading"]["taker"] * cost
                        : exchange.fees["trading"]["maker"] * cost,
                }

            }

			const oldBaseBalance = store.balance[base]
			const oldQuoteBalance = store.balance[quote]

			if (side === "buy") {
					store.balance = Object.assign(store.balance, {
							[quote]: {
								free: oldQuoteBalance.free - (cost + order.fee.cost),
							    used: oldQuoteBalance.used + (cost + order.fee.cost),
								total: oldQuoteBalance.total
							}
					})
			}

			if (side === "sell") {
					store.balance = Object.assign(store.balance, {
							[base]: {
								free: oldBaseBalance.free - amount,
								used: oldBaseBalance.used + amount,
								total: oldBaseBalance.total
							},
							[quote]: {
								free: oldQuoteBalance.free - order.fee.cost,
								used: oldQuoteBalance.used + order.fee.cost,
								total: oldQuoteBalance.total
							}
					})
			}
            store.openOrders.push(order);
            return order;

        } catch (err) {
            throw err
        }
    }

}

export default createCreateOrder;
