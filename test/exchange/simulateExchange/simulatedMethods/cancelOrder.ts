import { SimulatedExchangeResult } from "../../../../src/types";
import { describe, it } from "petzl";
import assert from "assert";

const cancelOrderTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await describe("cancelOrder", async () => {
		await it(`should cancel limit order`, async () => {
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
			singleExchange.flushStore();
		});
		await it(`should throw error if order is filled`, async () => {
			const {
				exchange,
				updateContext,
				fillOrders,
				store,
			} = singleExchange;

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

			fillOrders({
				timestamp: 2000,
				open: 3,
				high: 3,
				low: 3,
				close: 3,
				volume: 1,
			});

			const failedCancel = exchange.cancelOrder(order.id);

			await assert.rejects(failedCancel);

			singleExchange.flushStore();
		});
	});
};

export default cancelOrderTests;
