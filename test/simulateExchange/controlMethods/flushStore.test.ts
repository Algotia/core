import { simulatedExchange } from "../../test-utils";

describe("flushStore", () => {
	it("should flush store with 1 open order", async () => {
		const {
			exchange,
			store,
			updateContext,
			flushStore,
		} = simulatedExchange;
		updateContext(1, 1);

		await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		expect(store.currentPrice).toStrictEqual(1);
		expect(store.currentPrice).toStrictEqual(1);
		expect(store.openOrders.length).toStrictEqual(1);

		flushStore();

		expect(store.currentPrice).toStrictEqual(0);
		expect(store.currentTime).toStrictEqual(0);
		expect(store.openOrders.length).toStrictEqual(0);
	});
});
