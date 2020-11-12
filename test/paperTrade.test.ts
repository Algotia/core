import { paperTrade } from "../src/methods";
import { parsePeriod } from "../src/utils";
import { mockExchange } from "./utils";
import sinon from "sinon";
import { Exchange, OHLCV } from "../src/types";

describe("Paper trade", () => {
	test("paper", async () => {

		const clock = sinon.useFakeTimers();

		const exchange = mockExchange(
			"binance",
			{ BTC: 1, ETH: 0 },
			{ price: 0.1 }
		);

		const strategy = jest.fn(async (exchange: Exchange, data: OHLCV)=> {

			await exchange.createOrder(
				"ETH/BTC",
				"market",
				"buy",
				1
			);
		});

		const { start, stop } = await paperTrade(exchange, "1m", "ETH/BTC", strategy);

		start();

		setTimeout(() => {
			const res = stop();
			expect(res.balance.BTC.free).toBeCloseTo(0.0991);
			expect(res.openOrders.length).toStrictEqual(0)
		}, 120 * 60 * 1000);

		await clock.tickAsync(120 * 60 * 1000);

		expect(strategy.mock.calls.length).toStrictEqual(120);

		const { periodMs } = parsePeriod("1m");
		for (let i = 0; i < strategy.mock.calls.length; i++) {
			const thisCandle = strategy.mock.calls[i][1];

			expect(thisCandle).toHaveProperty("open", 0.1);
			expect(thisCandle).toHaveProperty("high", 0.1);
			expect(thisCandle).toHaveProperty("low", 0.1);
			expect(thisCandle).toHaveProperty("close", 0.1);
			expect(thisCandle).toHaveProperty("volume", 0.1);

			if (i === 0) {
				continue;
			}
			const lastCandle = strategy.mock.calls[i - 1][1];

			expect(lastCandle.timestamp).toStrictEqual(
				thisCandle.timestamp - periodMs
			);
		}
	});

	test("Paper trade cancel all orders", async () => {
		const clock = sinon.useFakeTimers();

		const exchange = mockExchange(
			"binance",
			{ BTC: 1, ETH: 0 },
			{ price: 0.1 }
		);

		const strategy = jest.fn(async (exchange: Exchange, data) => {
			const order = await exchange.createOrder(
				"ETH/BTC",
				"market",
				"buy",
				1
			);
			await exchange.cancelOrder(order.id);
		});

		const e = await paperTrade(exchange, "1m", "ETH/BTC", strategy);

		e.start();

		setTimeout(() => {
			const res = e.stop();
			// expect(res.balance.BTC.free).toBeCloseTo(0.0991);
			expect(res.closedOrders.length).toStrictEqual(120)

			for (const closedOrder of res.closedOrders) {
				expect(closedOrder.status).toStrictEqual("canceled")
			}

		}, 120 * 60 * 1000);

		await clock.tickAsync(120 * 60 * 1000);
	});
});
