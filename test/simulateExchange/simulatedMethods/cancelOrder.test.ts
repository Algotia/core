import { simulatedExchange, initialBalance, reset } from "../../test-utils";

describe("cancelOrder", () => {
	afterEach(() => {
		reset();
	});

	const orderTypes = ["limit", "market"] as const;
	for (const orderType of orderTypes) {
		it(`should cancel ${orderType} order`, async () => {
			const { exchange, updateContext, store } = simulatedExchange;

			updateContext(1000, 5);

			const order = await exchange.createOrder(
				"ETH/BTC",
				orderType,
				"buy",
				1,
				3
			);

			const totalCost = order.price * order.amount + order.fee.cost;

			expect(store.balance["BTC"].free).toStrictEqual(
				initialBalance.BTC - totalCost
			);
			expect(store.balance["BTC"].used).toStrictEqual(totalCost);
			expect(store.balance["BTC"].total).toStrictEqual(
				initialBalance.BTC
			);

			expect(store.openOrders.length).toStrictEqual(1);
			expect(store.closedOrders.length).toStrictEqual(0);

			await exchange.cancelOrder(order.id);

			expect(store.balance["BTC"].free).toBeCloseTo(
				initialBalance.BTC - order.fee.cost
			);

			expect(store.balance["BTC"].used).toStrictEqual(0);

			expect(store.balance["BTC"].total).toStrictEqual(
				initialBalance.BTC - order.fee.cost
			);

			expect(store.openOrders.length).toStrictEqual(0);
			expect(store.closedOrders.length).toStrictEqual(1);
			expect(store.closedOrders[0].status).toStrictEqual("canceled");
		});
	}

	it(`should throw error if order is filled`, async () => {
		const {
			exchange,
			updateContext,
			fillOrders,
			store,
		} = simulatedExchange;

		updateContext(1000, 5);

		const order = await exchange.createOrder(
			"ETH/BTC",
			"limit",
			"buy",
			1,
			3
		);

		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC - order.price * order.amount - order.fee.cost
		);

		expect(store.balance["BTC"].used).toStrictEqual(
			order.price * order.amount + order.fee.cost
		);

		expect(store.balance["BTC"].total).toStrictEqual(initialBalance.BTC);

		expect(store.openOrders.length).toStrictEqual(1);
		expect(store.closedOrders.length).toStrictEqual(0);

		fillOrders({
			timestamp: 2000,
			open: 3,
			high: 3,
			low: 3,
			close: 3,
			volume: 1,
		});

		const failedCancel = exchange.cancelOrder(order.id);

		expect(Promise.resolve(failedCancel)).rejects.toThrow();
	});
});
