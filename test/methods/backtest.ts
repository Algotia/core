import { backtest } from "../../src/methods/";
import { backfill } from "../../src/exchangeHelpers";
import { describe, it, assert, afterEach } from "quyz";
import {
	isCloseTo,
	simulatedExchange,
	initialBalance,
	reset,
} from "../../test-utils";

describe("backtest", () => {
	afterEach(() => {
		reset();
	});
	it(`should create an order every candle`, async () => {
		const { exchange } = simulatedExchange;
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", exchange);

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

		assert.strictEqual(result.openOrders.length, 0);
		assert.strictEqual(result.closedOrders.length, 23);
		assert.strictEqual(result.errors.length, 0);

		const totalCost = result.closedOrders.reduce((a, b) => a + b.cost, 0);

		const totalAmount = result.closedOrders.reduce(
			(a, b) => a + b.amount,
			0
		);

		assert.ok(
			isCloseTo(result.balance.BTC.free, initialBalance.BTC - totalCost)
		);
		assert.strictEqual(result.balance.BTC.used, 0);
		assert.ok(
			isCloseTo(result.balance.BTC.total, initialBalance.BTC - totalCost)
		);

		assert.strictEqual(
			result.balance.ETH.free,
			initialBalance.ETH + totalAmount
		);
		assert.strictEqual(result.balance.ETH.used, 0);
		assert.strictEqual(
			result.balance.ETH.total,
			initialBalance.ETH + totalAmount
		);
	});
});
