import { afterEach, describe, it, assert } from "quyz";
import { simulatedExchange, initialBalance, reset } from "../../../test-utils";

describe("fillOrders", () => {
	afterEach(() => {
		reset();
	});
	it("should fill market order immediately", async () => {
		const {
			exchange,
			updateContext,
			store,
			fillOrders,
		} = simulatedExchange;

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

		assert.strictEqual(store.openOrders.length, 0);
		assert.strictEqual(store.closedOrders.length, 0);

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
		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - store.closedOrders[0].cost
		);
	});

	it(`should fill limit order after 2 candles`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 10);

		const order = await exchange.createOrder(
			"ETH/BTC",
			"limit",
			"buy",
			1,
			5
		);

		assert.strictEqual(store.closedOrders.length, 0);
		assert.strictEqual(store.openOrders.length, 1);
		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.cost
		);

		fillOrders({
			timestamp: 1000,
			open: 10,
			high: 10,
			low: 10,
			close: 10,
			volume: 10,
		});

		assert.strictEqual(store.openOrders.length, 1);
		assert.strictEqual(store.closedOrders.length, 0);
		assert.strictEqual(store.openOrders[0].status, "open");

		updateContext(2000, 10);
		fillOrders({
			timestamp: 2000,
			open: 10,
			high: 10,
			low: 4,
			close: 10,
			volume: 10,
		});

		assert.strictEqual(store.openOrders.length, 0);
		assert.strictEqual(store.closedOrders.length, 1);

		assert.strictEqual(
			store.balance["BTC"].free,
			initialBalance.BTC - order.cost
		);
		assert.strictEqual(store.balance["BTC"].used, 0);
		assert.strictEqual(
			store.balance["ETH"].free,
			initialBalance.ETH + order.amount
		);

		const closedOrder = store.closedOrders[0];
		assert.strictEqual(closedOrder.lastTradeTimestamp, 2000);
		assert.strictEqual(closedOrder.average, 5);
		assert.strictEqual(closedOrder.status, "closed");
	});
});
