import { simulatedExchange, initialBalance, reset } from "../../test-utils";

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

		expect(store.openOrders.length).toStrictEqual(0);
		expect(store.closedOrders.length).toStrictEqual(0);

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
		expect(store.closedOrders[0].average).toStrictEqual(currentPrice);
		expect(store.balance["BTC"].free).toStrictEqual(
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

		expect(store.closedOrders.length).toStrictEqual(0);
		expect(store.openOrders.length).toStrictEqual(1);
		expect(store.balance["BTC"].free).toStrictEqual(
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

		expect(store.openOrders.length).toStrictEqual(1);
		expect(store.closedOrders.length).toStrictEqual(0);
		expect(store.openOrders[0].status).toStrictEqual("open");

		updateContext(2000, 10);
		fillOrders({
			timestamp: 2000,
			open: 10,
			high: 10,
			low: 4,
			close: 10,
			volume: 10,
		});

		expect(store.openOrders.length).toStrictEqual(0);
		expect(store.closedOrders.length).toStrictEqual(1);

		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC - order.cost
		);
		expect(store.balance["BTC"].used).toStrictEqual(0);
		expect(store.balance["ETH"].free).toStrictEqual(
			initialBalance.ETH + order.amount
		);

		const closedOrder = store.closedOrders[0];
		expect(closedOrder.lastTradeTimestamp).toStrictEqual(2000);
		expect(closedOrder.average).toStrictEqual(5);
		expect(closedOrder.status).toStrictEqual("closed");
	});
});
