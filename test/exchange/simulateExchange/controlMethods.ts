import { SimulatedExchangeResult } from "../../../src/types";

const controlMethodTests = (exchanges: SimulatedExchangeResult[]) => {
	describe("fillOrders", () => {
		test("Market order filled after 1 candle", async () => {
			for (const {
				exchange,
				updateContext,
				store,
				fillOrders,
			} of exchanges) {
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

				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.closedOrders.length).toStrictEqual(0);

				expect(store.openOrders[0].status).toStrictEqual("open");
				expect(store.openOrders[0].filled).toStrictEqual(0);
				expect(store.openOrders[0].average).toStrictEqual(null);

				fillOrders(candle);

				expect(store.closedOrders.length).toStrictEqual(1);
				expect(store.openOrders.length).toStrictEqual(0);

				expect(store.closedOrders[0].status).toStrictEqual("closed");
				expect(store.closedOrders[0].filled).toStrictEqual(1);
				expect(store.closedOrders[0].average).toStrictEqual(
					currentPrice
				);
			}
		});
	});

	describe("updateContext", () => {
		test("Time and price update as expected", async () => {
			for (const { store, updateContext } of exchanges) {
				expect(store.currentTime).toStrictEqual(0);
				expect(store.currentPrice).toStrictEqual(0);

				updateContext(1, 1);

				expect(store.currentTime).toStrictEqual(1);
				expect(store.currentPrice).toStrictEqual(1);
			}
		});
	});

	describe("flushStore", () => {
		test("flushStore works", async () => {
			for (const {
				exchange,
				store,
				updateContext,
				flushStore,
			} of exchanges) {
				updateContext(1, 1);

				await exchange.createOrder("ETH/BTC", "market", "buy", 1);

				expect(store.currentPrice).toStrictEqual(1);
				expect(store.currentPrice).toStrictEqual(1);
				expect(store.openOrders.length).toStrictEqual(1);

				flushStore();

				expect(store.currentPrice).toStrictEqual(0);
				expect(store.currentTime).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(0);
			}
		});
	});
};

export default controlMethodTests;
