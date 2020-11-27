import { SimulatedExchangeResult } from "../../../../src/types";
import { describe, it } from "petzl";
import assert from "assert";

const createOrderTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await describe("create order", async () => {
		await it(`should create market order`, async () => {
			const {
				exchange,
				store,
				updateContext,
				fillOrders,
			} = singleExchange;

			updateContext(1000, 9);

			const order = await exchange.createOrder(
				"ETH/BTC",
				"market",
				"buy",
				1
			);

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
			singleExchange.flushStore();
		});

		await it(`should create limit order`, async () => {
			const {
				exchange,
				store,
				updateContext,
				fillOrders,
			} = singleExchange;

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
			singleExchange.flushStore();
		});

		/* await test("Throws when order costs more than available fund", async () => { */
		/* 	const { updateContext, exchange } = singleExchange; */

		/* 	updateContext(1000, 100); */

		/* 	const order = exchange.createOrder("ETH/BTC", "market", "buy", 2); */

		/* 	/1* expect(order).rejects.toThrow(InsufficientFunds); *1/ */
		/* 	assert.rejects(order, InsufficientFunds); */
		/* }); */

		/* await test("Throws on non-existent pair", async () => { */
		/* 	const { updateContext, exchange } = singleExchange; */

		/* 	updateContext(1000, 10); */

		/* 	const order = exchange.createOrder("DOESNT/EXIST", "market", "buy", 1); */

		/* 	assert.rejects(order, InsufficientFunds); */
		/* }); */
	});
};

export default createOrderTests;
