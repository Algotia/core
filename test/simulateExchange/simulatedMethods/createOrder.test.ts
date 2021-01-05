import { BadSymbol, InsufficientFunds } from "ccxt";
import { simulatedExchange, initialBalance, reset } from "../../test-utils";

describe("create order", () => {
	afterEach(() => {
		reset();
	});

	it(`should create market order`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 9);

		const order = await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		expect(store.closedOrders.length).toStrictEqual(0);
		expect(store.openOrders.length).toStrictEqual(1);

		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC - order.cost
		);
		expect(store.balance["BTC"].used).toStrictEqual(order.cost);

		fillOrders({
			timestamp: 1000,
			open: 10,
			high: 10,
			low: 10,
			close: 10,
			volume: 10,
		});

		expect(store.closedOrders[0].trades.length).toStrictEqual(1);

		expect(store.openOrders.length).toStrictEqual(0);
		expect(store.closedOrders.length).toStrictEqual(1);
		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC - order.cost
		);

		expect(store.balance["BTC"].used).toStrictEqual(0);
		expect(store.balance["ETH"].free).toStrictEqual(
			initialBalance.ETH + order.amount
		);

		expect(store.balance["ETH"].used).toStrictEqual(0);
	});

	it(`should create limit order`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 9);

		const order = await exchange.createOrder(
			"ETH/BTC",
			"market",
			"sell",
			1
		);

		expect(store.closedOrders.length).toStrictEqual(0);
		expect(store.openOrders.length).toStrictEqual(1);

		expect(store.balance["ETH"].free).toStrictEqual(
			initialBalance.ETH - order.amount
		);
		expect(store.balance["ETH"].used).toStrictEqual(order.amount);

		fillOrders({
			timestamp: 1000,
			open: 8,
			high: 8,
			low: 8,
			close: 8,
			volume: 8,
		});

		expect(store.openOrders.length).toStrictEqual(0);
		expect(store.closedOrders.length).toStrictEqual(1);

		expect(store.closedOrders[0].trades.length).toStrictEqual(1);

		expect(store.balance["ETH"].free).toStrictEqual(
			initialBalance.ETH - order.amount
		);

		expect(store.balance["ETH"].used).toStrictEqual(0);

		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC + store.closedOrders[0].trades[0].cost
		);
		expect(store.balance["BTC"].used).toStrictEqual(0);
	});

	it("Throws error when funds are insufficient", async () => {
		const { updateContext, exchange } = simulatedExchange;

		updateContext(1000, 100);

		const order = exchange.createOrder("ETH/BTC", "market", "buy", 2);

		expect(order).rejects.toThrow(InsufficientFunds);
	});

	test("Throws on non-existent pair", () => {
		const { updateContext, exchange } = simulatedExchange;

		updateContext(1000, 10);

		expect(
			exchange.createOrder("DOESNT/EXIST", "market", "buy", 1)
		).rejects.toThrow(BadSymbol);
	});
});
