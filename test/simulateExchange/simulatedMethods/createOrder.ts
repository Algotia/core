import { InsufficientFunds } from "ccxt";
import { describe, afterEach, it, assert } from "quyz";
import { simulatedExchange, initialBalance, reset } from "../../../test-utils";

describe("create order", () => {
	afterEach(() => {
		reset();
	});

	it(`should create market order`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 9);

		const order = await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		assert.strictEqual(store.closedOrders.length, 0);
		assert.strictEqual(store.openOrders.length, 1);

		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.cost
		);
		assert.strictEqual(store.balance["BTC"].used, order.cost);

		fillOrders({
			timestamp: 1000,
			open: 10,
			high: 10,
			low: 10,
			close: 10,
			volume: 10,
		});

		assert.strictEqual(store.closedOrders[0].trades.length, 1);

		assert.strictEqual(store.openOrders.length, 0);
		assert.strictEqual(store.closedOrders.length, 1);
		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.cost
		);

		assert.strictEqual(store.balance["BTC"].used, 0);
		assert.strictEqual(
			store.balance["ETH"].free,
			initialBalance.ETH + order.amount
		);

		assert.strictEqual(store.balance["ETH"].used, 0);
	});

	it(`should create limit order`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 9);

		const order = await exchange.createOrder(
			"ETH/BTC",
			"market",
			"sell",
			1
		);

		assert.strictEqual(store.closedOrders.length, 0);
		assert.strictEqual(store.openOrders.length, 1);

		assert.strictEqual(
			store.balance["ETH"].free,
			initialBalance.ETH - order.amount
		);
		assert.strictEqual(store.balance["ETH"].used, order.amount);

		fillOrders({
			timestamp: 1000,
			open: 8,
			high: 8,
			low: 8,
			close: 8,
			volume: 8,
		});

		assert.strictEqual(store.openOrders.length, 0);
		assert.strictEqual(store.closedOrders.length, 1);

		assert.strictEqual(store.closedOrders[0].trades.length, 1);

		assert.strictEqual(
			store.balance["ETH"].free,
			initialBalance.ETH - order.amount
		);

		assert.strictEqual(store.balance["ETH"].used, 0);

		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC + store.closedOrders[0].trades[0].cost
		);
		assert.strictEqual(store.balance["BTC"].used, 0);
	});

	it("Throws error when funds are insufficient", async () => {
		const { updateContext, exchange } = simulatedExchange;

		updateContext(1000, 100);

		const order = exchange.createOrder("ETH/BTC", "market", "buy", 2);

		/* expect(order).rejects.toThrow(InsufficientFunds); */
		assert.rejects(order, InsufficientFunds);
	});

	/* await test("Throws on non-existent pair", async () => { */
	/* 	const { updateContext, exchange } = singleExchange; */

	/* 	updateContext(1000, 10); */

	/* 	const order = exchange.createOrder("DOESNT/EXIST", "market", "buy", 1); */

	/* 	assert.rejects(order, InsufficientFunds); */
	/* }); */
});
