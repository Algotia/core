import {
	SimulatedExchangeResult,
} from "../../../src/types";

const cancelOrderTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	test("Canceled order is closed and fee is subtracted", async () => {
		for (const { exchange, updateContext, store } of exchanges) {
			updateContext(1000, 5);

			const order = await exchange.createOrder(
				"ETH/BTC",
				"limit",
				"buy",
				1,
				3
			);

			expect(store.balance["BTC"].free).toStrictEqual(
				initialBalance.BTC - order.cost
			);
			expect(store.balance["BTC"].used).toStrictEqual(order.cost);
			expect(store.balance["BTC"].total).toStrictEqual(
				initialBalance.BTC
			);

			expect(store.openOrders.length).toStrictEqual(1);
			expect(store.closedOrders.length).toStrictEqual(0);

			await exchange.cancelOrder(order.id);

			expect(store.balance["BTC"].free).toStrictEqual(
				initialBalance.BTC - order.fee.cost
			);
			expect(store.balance["BTC"].used).toStrictEqual(0);
			expect(store.balance["BTC"].total).toStrictEqual(
				initialBalance.BTC - order.fee.cost
			);

			expect(store.openOrders.length).toStrictEqual(0);
			expect(store.closedOrders.length).toStrictEqual(1);
			expect(store.closedOrders[0].status).toStrictEqual("canceled");
		}
	});
};

export default cancelOrderTests;
