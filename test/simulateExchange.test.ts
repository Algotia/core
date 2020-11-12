import { AllowedExchangeIDs } from "../src/types";
import { simulateExchange } from "../src/utils";

describe("simulateExchange", () => {
	test("Create order works as expected", async () => {
		try {
			for (const exchangeId of AllowedExchangeIDs) {
				const exchange = simulateExchange(exchangeId, {
					BTC: 11,
					ETH: 0,
				});

				exchange.updateContext(1000, 10);

				const order = await exchange.exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);

				expect(exchange.store.closedOrders.length).toStrictEqual(0);
				expect(exchange.store.openOrders.length).toStrictEqual(1);
				expect(exchange.store.balance["BTC"].free).toBeCloseTo(
					11 - order.cost
				);

				exchange.fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(exchange.store.openOrders.length).toStrictEqual(0);
				expect(exchange.store.closedOrders.length).toStrictEqual(1);
			}
		} catch (err) {
			throw err;
		}
	});

	test("Edit order works as expected", async () => {
		try {
			for (const exchangeId of AllowedExchangeIDs) {
				const exchange = simulateExchange(exchangeId, {
					BTC: 11,
					ETH: 0,
				});

				exchange.updateContext(1000, 10);

				const order = await exchange.exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);

				const editedOrder = await exchange.exchange.editOrder(
					order.id,
					"ETH/BTC",
					"market",
					"buy",
					0.5
				);

				expect(exchange.store.closedOrders.length).toStrictEqual(0);
				expect(exchange.store.openOrders.length).toStrictEqual(1);
				expect(exchange.store.openOrders[0].amount).toStrictEqual(0.5);
				expect(exchange.store.balance["BTC"].free).toBeCloseTo(
					11 - editedOrder.cost  - order.fee.cost
				);
				expect(exchange.store.balance["BTC"].used).toStrictEqual(editedOrder.cost)

				exchange.fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(exchange.store.openOrders.length).toStrictEqual(0);
				expect(exchange.store.closedOrders.length).toStrictEqual(1);

				expect(exchange.store.balance.ETH.free).toStrictEqual(0.5)
				expect(exchange.store.balance.BTC.used).toStrictEqual(0)

			}
		} catch (err) {
			throw err;
		}
	});
});
