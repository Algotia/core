import { SimulatedExchangeResult } from "../../../../src/types";
import { test } from "../../../testUtils";
import assert from "assert";

const fillOrdersTests = async (singleExchange: SimulatedExchangeResult) => {
	await test("fillOrders: market", async () => {
		const { exchange, updateContext, store, fillOrders } = singleExchange;
		const candle = {
			timestamp: 100,
			open: 1,
			high: 1,
			low: 1,
			close: 75,
			volume: 1,
		};

		const currentPrice = 5;
		updateContext(candle.timestamp, currentPrice);

		await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		assert.strictEqual(store.openOrders.length, 1);
		assert.strictEqual(store.closedOrders.length, 0);

		assert.strictEqual(store.openOrders[0].status, "open");
		assert.strictEqual(store.openOrders[0].filled, 0);
		assert.strictEqual(store.openOrders[0].average, null);

		fillOrders(candle);

		assert.strictEqual(store.closedOrders.length, 1);
		assert.strictEqual(store.openOrders.length, 0);

		assert.strictEqual(store.closedOrders[0].status, "closed");
		assert.strictEqual(store.closedOrders[0].filled, 1);
		assert.strictEqual(store.closedOrders[0].average, currentPrice);
	});
};

export default fillOrdersTests;
