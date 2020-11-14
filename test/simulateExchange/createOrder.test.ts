import { AllowedExchangeIDs } from "../../src/types";
import { simulateExchange } from "../../src/utils";

describe("simulateExchange", () => {
	test("Create order works as expected", async () => {
		try {
			for (const exchangeId of AllowedExchangeIDs) {
				const { exchange, store, updateContext, fillOrders } = await simulateExchange(exchangeId, {
					BTC: 11,
					ETH: 0,
				});

				updateContext(1000, 10);

				const order = await exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);

				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.balance["BTC"].free).toBeCloseTo(
					11 - order.cost
				);

				fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(1);
			}
		} catch (err) {
			throw err;
		}
	});

	test("Create order throws on bad input", async ()=>{
		try {
			for (const exchangeId of AllowedExchangeIDs) {
				const simulatedExchange = await simulateExchange(exchangeId, {
					BTC: 11,
					ETH: 0,
				});

				const { updateContext, exchange, store } = simulatedExchange;

				updateContext(1000, 10);

				const order = await exchange.createOrder(
					"DOESNT/EXIST",
					"market",
					"buy",
					1
				);

				expect(order).toStrictEqual(undefined)

				expect(store.errors.length).toStrictEqual(1)

			}
		} catch(err) {
			throw err
		}
	})
});
