import { simulatedExchange, initialBalance, reset } from "../../test-utils";

describe("edit order", () => {
	afterEach(() => {
		reset();
	});
	it(`should edit market order if not filled`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		expect(store.balance["BTC"].free).toStrictEqual(initialBalance.BTC);
		expect(store.balance["BTC"].used).toStrictEqual(0);

		updateContext(1000, 9);

		const order = await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		const editedOrder = await exchange.editOrder(
			order.id,
			"ETH/BTC",
			"market",
			"buy",
			0.5
		);

		expect(store.closedOrders.length).toStrictEqual(0);
		expect(store.openOrders.length).toStrictEqual(1);
		expect(store.openOrders[0].amount).toStrictEqual(0.5);
		expect(store.balance["BTC"].free).toBeCloseTo(
			initialBalance.BTC - editedOrder.cost - order.fee.cost
		);
		expect(store.balance["BTC"].used).toStrictEqual(editedOrder.cost);

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

		expect(store.balance.ETH.free).toStrictEqual(
			initialBalance.ETH + editedOrder.amount
		);
		expect(store.balance.BTC.used).toStrictEqual(0);
	});

	it("should fail to edit a filled order", async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 9);

		const order = await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		expect(store.balance["BTC"].free).toBeCloseTo(
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

		expect(store.balance.ETH.free).toStrictEqual(
			initialBalance.ETH + order.amount
		);
		expect(store.balance.BTC.used).toStrictEqual(0);

		const editedOrder = exchange.editOrder(
			order.id,
			"ETH/BTC",
			"market",
			"buy",
			0.5
		);

		expect(editedOrder).rejects.toThrow();
	});
});
