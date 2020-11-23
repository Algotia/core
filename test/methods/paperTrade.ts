import { paperTrade } from "../../src/methods";
import { Exchange, OHLCV, SimulatedExchangeResult } from "../../src/types";
import sinon from "sinon";
import { test } from "../testUtils";
import assert from "assert";

const paperTradeTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await test(`Paper trade: market order buy`, async () => {
		const clock = sinon.useFakeTimers();

		// If paperTrade is started exactly on a strategy period (1m in this case)
		// Then the strategy will be called immediately
		// See the opposite of this behavior in the next test
		const startDate = new Date("1/1/2020 12:00:00 AM GMT").getTime();

		clock.tick(startDate);

		const strategy = sinon.fake(async (exchange: Exchange, data: OHLCV) => {
			await exchange.createOrder("ETH/BTC", "market", "buy", 1);
		});

		const { start, stop } = await paperTrade(
			singleExchange,
			"1m",
			"ETH/BTC",
			strategy
		);

		start();

		await clock.tickAsync(120 * 60 * 1000);

		const res = stop();

		assert.strictEqual(res.openOrders.length, 0);

		assert.strictEqual(strategy.getCalls().length, 121);

		clock.restore();
	});

	await test(`Paper trade: cancel all orders`, async () => {

		const clock = sinon.useFakeTimers();

		const startDate = new Date("1/1/2020 12:00:01 AM GMT").getTime();

		clock.tick(startDate);

		const strategy = sinon.fake(async (exchange: Exchange, data) => {
			const order = await exchange.createOrder(
				"ETH/BTC",
				"market",
				"buy",
				1
			);
			await exchange.cancelOrder(order.id);
		});

		const { start, stop } = await paperTrade(
			singleExchange,
			"1m",
			"ETH/BTC",
			strategy
		);

		start();

		await clock.tickAsync(120 * 60 * 1000);

		const res = stop();
		// expect(res.balance.BTC.free).toBeCloseTo(0.0991);
		assert.strictEqual(res.closedOrders.length, 120);

		for (const closedOrder of res.closedOrders) {
			assert.strictEqual(closedOrder.status, "canceled");
		}

		clock.restore();
	});
};

export default paperTradeTests;
