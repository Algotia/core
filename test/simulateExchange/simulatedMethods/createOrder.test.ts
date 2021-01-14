import { BadSymbol, InsufficientFunds } from "ccxt";
import { SSL_OP_TLS_D5_BUG } from "constants";
import { parsePair } from "../../../src/utils";
import { simulatedExchange, initialBalance, reset } from "../../test-utils";

describe("create order", () => {
	afterEach(() => {
		reset();
	});

	const orderTypes = ["market", "limit"] as const;
	const orderSides = ["buy", "sell"] as const;

	for (const type of orderTypes) {
		for (const side of orderSides) {
			it(`should create ${type} ${side} order`, async () => {
				const {
					exchange,
					store,
					updateContext,
					fillOrders,
				} = simulatedExchange;

				updateContext(1000, 5);

				const order = await exchange.createOrder(
					"ETH/BTC",
					type,
					side,
					1,
					type === "limit" && 5
				);

				const [base, quote] = parsePair("ETH/BTC");

				const cost = order.price * order.amount;
				const fee = order.fee.cost;
				const totalCost = cost + fee;

				if (side === "buy") {
					expect(store.balance[quote].free).toStrictEqual(
						initialBalance.BTC - totalCost
					);
					expect(store.balance[quote].used).toStrictEqual(totalCost);
					expect(store.balance[quote].total).toStrictEqual(
						initialBalance.BTC
					);
				} else {
					expect(store.balance[base].free).toStrictEqual(
						initialBalance.BTC - order.amount
					);
					expect(store.balance[base].used).toStrictEqual(
						order.amount
					);
					expect(store.balance[base].total).toStrictEqual(
						initialBalance.BTC
					);

					expect(store.balance[quote].free).toStrictEqual(
						initialBalance.BTC - fee
					);
					expect(store.balance[quote].used).toStrictEqual(fee);
				}

				expect(store.openOrders.length).toStrictEqual(1);

				expect(store.openOrders[0]).toStrictEqual(order);

				fillOrders({
					timestamp: 1000,
					open: 5,
					high: 5,
					low: 5,
					close: 5,
					volume: 1,
				});

				expect(store.balance[base].used).toStrictEqual(0);
				expect(store.balance[quote].used).toStrictEqual(0);

				if (side === "buy") {
					expect(store.balance[quote].free).toStrictEqual(
						initialBalance.BTC - totalCost
					);
					expect(store.balance[quote].total).toStrictEqual(
						initialBalance.BTC - totalCost
					);

					expect(store.balance[base].free).toStrictEqual(
						initialBalance.ETH + order.amount
					);
					expect(store.balance[base].total).toStrictEqual(
						initialBalance.ETH + order.amount
					);
				} else {
					expect(store.balance[base].free).toStrictEqual(
						initialBalance.ETH - order.amount
					);
					expect(store.balance[base].total).toStrictEqual(
						initialBalance.ETH - order.amount
					);

					expect(store.balance[quote].free).toStrictEqual(
						initialBalance.BTC + cost - fee
					);
					expect(store.balance[quote].total).toStrictEqual(
						initialBalance.BTC + cost - fee
					);
				}
			});
		}
	}

	it(`should create market order`, async () => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;

		updateContext(1000, 10);

		const order = await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		const filledCost = order.price * order.amount + order.fee.cost;

		expect(store.closedOrders.length).toStrictEqual(0);

		expect(store.openOrders.length).toStrictEqual(1);

		expect(store.balance["BTC"].free).toStrictEqual(
			initialBalance.BTC - filledCost
		);

		expect(store.balance["BTC"].used).toStrictEqual(filledCost);

		expect(store.balance["BTC"].total).toStrictEqual(initialBalance.BTC);

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
			initialBalance.BTC - filledCost
		);

		expect(store.balance["BTC"].used).toStrictEqual(0);

		expect(store.balance["ETH"].free).toStrictEqual(
			initialBalance.ETH + order.amount
		);

		expect(store.balance["ETH"].used).toStrictEqual(0);
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
