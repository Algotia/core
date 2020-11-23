import { SimulatedExchangeResult } from "../../../../src/types";
import { test } from "../../../testUtils";
import assert from "assert";

const updateContextTests = async (singleExchange: SimulatedExchangeResult) => {
	await test("updateContext: Time and price update as expected", async () => {
		const { store, updateContext } = singleExchange;
		assert.strictEqual(store.currentTime, 0);
		assert.strictEqual(store.currentPrice, 0);

		updateContext(1, 1);

		assert.strictEqual(store.currentTime, 1);
		assert.strictEqual(store.currentPrice, 1);
	});
};

export default updateContextTests
