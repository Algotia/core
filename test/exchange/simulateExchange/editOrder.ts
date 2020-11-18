import { SimulatedExchangeResult } from "../../../src/types";

const editOrderTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	test("Edit order works as expected", async () => {
		try {
			for (const {
				exchange,
				store,
				updateContext,
				fillOrders,
			} of exchanges) {
				updateContext(1000, 9);

				const order = await exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);

				const editedOrder = await exchange.editOrder(
					order.id,
					"ETH/BTC",
					"market",
					"buy",
					0.5
				);

				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.openOrders[0].amount).toStrictEqual(0.5);
				expect(store.balance["BTC"].free).toBeCloseTo(
					initialBalance.BTC - editedOrder.cost - order.fee.cost
				);
				expect(store.balance["BTC"].used).toStrictEqual(
					editedOrder.cost
				);

				fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(1);

				expect(store.balance.ETH.free).toStrictEqual(
					initialBalance.ETH + editedOrder.amount
				);
				expect(store.balance.BTC.used).toStrictEqual(0);
			}
		} catch (err) {
			throw err;
		}
	});
};

export default editOrderTests;
