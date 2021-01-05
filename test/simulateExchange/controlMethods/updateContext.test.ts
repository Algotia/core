import { simulatedExchange, reset } from "../../test-utils";

describe("updateContext", () => {
	afterEach(() => {
		reset();
	});

	it("should update time and price", async () => {
		const { store, updateContext } = simulatedExchange;
		expect(store.currentTime).toStrictEqual(0);
		expect(store.currentPrice).toStrictEqual(0);

		updateContext(1, 1);

		expect(store.currentTime).toStrictEqual(1);
		expect(store.currentPrice).toStrictEqual(1);
	});
});
