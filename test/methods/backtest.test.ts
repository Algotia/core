import { inspect } from "util";
import { backtest } from "../../src/methods/";
import { simulatedExchange, initialBalance, reset } from "../test-utils";

describe("backtest", () => {
	afterEach(() => {
		reset();
	});
	it(`should create an order every candle`, async () => {
		const candles = require("./__fixtures__/candles").default;

		const result = await backtest({
			simulatedExchange,
			data: candles,
			strategy: async (exchange) => {
				await exchange.createOrder("ETH/BTC", "market", "buy", 1);
			},
		});

		expect(result.openOrders.length).toStrictEqual(0);
		expect(result.closedOrders.length).toStrictEqual(candles.length - 1);
		expect(result.errors.length).toStrictEqual(0);

		const totalCost = result.closedOrders.reduce(
			(a, b) => a + b.cost + b.fee.cost,
			0
		);

		const totalAmount = result.closedOrders.reduce(
			(a, b) => a + b.amount,
			0
		);

		expect(result.balance.BTC.free).toBeCloseTo(
			initialBalance.BTC - totalCost
		);

		expect(result.balance.BTC.used).toStrictEqual(0);

		expect(result.balance.BTC.total).toBeCloseTo(
			initialBalance.BTC - totalCost
		);

		expect(result.balance.ETH.free).toStrictEqual(
			initialBalance.ETH + totalAmount
		);
		expect(result.balance.ETH.used).toStrictEqual(0);
		expect(result.balance.ETH.total).toStrictEqual(
			initialBalance.ETH + totalAmount
		);
	});

	it(`Should capture errors`, async () => {
		const candles = require("./__fixtures__/candles").default;

		const result = await backtest({
			simulatedExchange,
			data: candles,
			strategy: async (exchange) => {
				await exchange.createOrder("ETH/BTC", "market", "buy", 1000);
			},
		});

		expect(result.errors.length).toStrictEqual(candles.length - 1);

		for (const error of result.errors) {
			expect(typeof error).toStrictEqual("object");
			expect(error).toHaveProperty("timestamp");
			expect(error).toHaveProperty("message");
		}
	});
});
