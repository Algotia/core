import { backtest } from "../../src/methods/";
import { backfill } from "../../src/exchange";
import { SimulatedExchangeResult } from "../../src/types";
import { isCloseTo, test } from "../testUtils";
import assert from "assert";

const backtestTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await test(`Backtest`, async () => {
		const { exchange } = singleExchange;
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", exchange);

		const result = await backtest(
			singleExchange,
			candles,
			async (exchange) => {
				try {
					await exchange.createOrder("ETH/BTC", "market", "buy", 1);
				} catch (err) {
					throw err;
				}
			}
		);

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
};

export default backtestTests;
