import { afterEach, describe, it, assert } from "quyz";
import { simulatedExchange, initialBalance, reset } from "../../../test-utils";

describe("cancelOrder", () => {
	afterEach(() => {
		reset();
	});

	for (const orderType of ["limit", "market"]) {
		it(`should cancel ${orderType} order`, async () => {
			const { exchange, updateContext, store } = simulatedExchange;

			updateContext(1000, 5);

			const order = await exchange.createOrder(
				"ETH/BTC",
				orderType,
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
	}

	it(`should throw error if order is filled`, async () => {
		const {
			exchange,
			updateContext,
			fillOrders,
			store,
		} = simulatedExchange;

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
	});
});
