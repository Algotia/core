import { SimulatedExchangeResult } from "../../../../src/types";
import { test } from "../../../testUtils";
import assert from "assert";

const flushStoreTests = async (singleExchange: SimulatedExchangeResult) => {
	await test("flushStore: flush store with 1 open order", async () => {
		const { exchange, store, updateContext, flushStore } = singleExchange;
		updateContext(1, 1);

		await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		assert.strictEqual(store.currentPrice, 1);
		assert.strictEqual(store.currentPrice, 1);
		assert.strictEqual(store.openOrders.length, 1);

		flushStore();

		assert.strictEqual(store.currentPrice, 0);
		assert.strictEqual(store.currentTime, 0);
		assert.strictEqual(store.openOrders.length, 0);
	});
};

export default flushStoreTests;
