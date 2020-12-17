import { describe, afterEach, it, assert } from "quyz";
import { simulatedExchange, reset } from "../../../test-utils";

describe("updateContext", () => {
	afterEach(() => {
		reset();
	});

	it("should update time and price", async () => {
		const { store, updateContext } = simulatedExchange;
		assert.strictEqual(store.currentTime, 0);
		assert.strictEqual(store.currentPrice, 0);

		updateContext(1, 1);

		assert.strictEqual(store.currentTime, 1);
		assert.strictEqual(store.currentPrice, 1);
	});
});
