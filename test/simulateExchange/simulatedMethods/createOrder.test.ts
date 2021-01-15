import { BadSymbol, InsufficientFunds } from "ccxt";
import { parsePair } from "../../../src/utils";
import {
	simulatedExchange,
	initialBalance,
	reset,
	initialBalanceSymbol,
} from "../../test-utils";

const [base, quote] = parsePair(initialBalanceSymbol);

describe("create order", () => {
	afterEach(() => {
		reset();
	});

	const orderTypes = ["market", "limit"] as const;
	const orderSides = ["buy", "sell"] as const;
	const symbol = initialBalanceSymbol;

	for (const type of orderTypes) {
		for (const side of orderSides) {
			it(`should create ${type} ${side} order`, async () => {
				const { exchange, store, updateContext } = simulatedExchange;

				updateContext(1000, 5);

				const order = await exchange.createOrder(
					symbol,
					type,
					side,
					1,
					type === "limit" && 5
				);

				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.openOrders[0]).toStrictEqual(order);

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
						initialBalance[quote]
					);

					expect(store.balance[quote].free).toStrictEqual(
						initialBalance.BTC - fee
					);
					expect(store.balance[quote].used).toStrictEqual(fee);
					expect(store.balance[quote].total).toStrictEqual(
						initialBalance[quote]
					);
				}
			});
		}
	}

	it("Should throw error when funds are sufficient for fees", async () => {
		const { updateContext, exchange } = simulatedExchange;

		updateContext(1000, initialBalance[quote]);

		const order = exchange.createOrder(symbol, "market", "buy", 1);
		await expect(order).rejects.toThrowError(InsufficientFunds);
		try {
			await order;
		} catch (err) {
			// Make sure the error message includes something about fees
			expect(err.message).toMatch("fees");
		}
	});

	it("Throws error when funds are insufficient", async () => {
		const { updateContext, exchange } = simulatedExchange;

		updateContext(1000, initialBalance[quote] + 1);

		const order = exchange.createOrder(symbol, "market", "buy", 1);

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
