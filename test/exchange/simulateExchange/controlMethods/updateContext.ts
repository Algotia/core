import { SimulatedExchangeResult } from "../../../../src/types";
import { describe, it } from "petzl";
import assert from "assert";

const updateContextTests = async (singleExchange: SimulatedExchangeResult) => {
	await describe("updateContext", async () => {
		await it("should update time and price", async () => {
			const { store, updateContext } = singleExchange;
			assert.strictEqual(store.currentTime, 0);
			assert.strictEqual(store.currentPrice, 0);

			updateContext(1, 1);

			assert.strictEqual(store.currentTime, 1);
			assert.strictEqual(store.currentPrice, 1);
			singleExchange.flushStore();
		});
	});
};

export default updateContextTests;
