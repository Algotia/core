import { SimulatedExchangeResult } from "../../../../src/types";
import { test } from "../../../testUtils";
import assert from "assert";

const cancelOrderTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await test(`${singleExchange.exchange.id}: simulatedMethod - cancelOrder`, async () => {
		const { exchange, updateContext, store } = singleExchange;

		updateContext(1000, 5);

		const order = await exchange.createOrder(
			"ETH/BTC",
			"limit",
			"buy",
			1,
			3
		);

		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.cost
		);
		assert.strictEqual(store.balance["BTC"].used, order.cost);
		assert.strictEqual(store.balance["BTC"].total, initialBalance.BTC);

		assert.strictEqual(store.openOrders.length, 1);
		assert.strictEqual(store.closedOrders.length, 0);

		await exchange.cancelOrder(order.id);

		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.fee.cost
		);
		assert.strictEqual(store.balance["BTC"].used, 0);
		assert.strictEqual(
			store.balance["BTC"].total,
			initialBalance.BTC - order.fee.cost
		);

		assert.strictEqual(store.openOrders.length, 0);
		assert.strictEqual(store.closedOrders.length, 1);
		assert.strictEqual(store.closedOrders[0].status, "canceled");
	});
};

export default cancelOrderTests;
