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
				try {
					await exchange.createOrder("ETH/BTC", "market", "buy", 1);
				} catch (err) {
					throw err;
				}
			},
		});

		expect(result.openOrders.length).toStrictEqual(0);
		expect(result.closedOrders.length).toStrictEqual(23);
		expect(result.errors.length).toStrictEqual(0);

		const totalCost = result.closedOrders.reduce((a, b) => a + b.cost, 0);

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
});
