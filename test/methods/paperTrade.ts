import { paperTrade } from "../../src/algotia";
import { Exchange, OHLCV, Strategy, PaperTradeOptions } from "../../src/types";
import {
	simulatedExchange,
	reset,
	initialBalance,
	isCloseTo,
} from "../../test-utils";
import sinon from "sinon";
import { describe, it, assert, afterEach } from "quyz";
import { EventEmitter } from "events";

describe("paperTrade", async () => {
	afterEach(() => {
		reset();
	});

	const createArgs = (strategy: Strategy): PaperTradeOptions => {
		return {
			simulatedExchange,
			period: "1m",
			pair: "ETH/BTC",
			strategy,
		};
	};

	it("should return an EventEmitter", async () => {
		const strategy = () => {};
		const controller = await paperTrade(createArgs(strategy));
		assert(controller instanceof EventEmitter);
	});

	const startTimeData: [string, string, number][] = [
		[
			"should start immediately if 'start' event on strategy period",
			"1/1/2020 12:00:00 AM GMT",
			121,
		],
		[
			"should start on next strategy candle if 'start' event not on strategy period",
			"1/1/2020 12:00:01 AM GMT",
			120,
		],
	];

	for (const [title, date, expected] of startTimeData) {
		it(title, async () => {
			const clock = sinon.useFakeTimers();
			const startDate = new Date(date).getTime();

			clock.tick(startDate);

			const strategy = sinon.fake(async (exchange: Exchange) => {
				await exchange.createOrder("ETH/BTC", "market", "buy", 1);
			});

			const controller = await paperTrade(createArgs(strategy));

			const candleSpy = sinon.spy(() => {});

			controller.on("candle", candleSpy);

			controller.emit("start");

			await clock.tickAsync(120 * 60 * 1000);

			assert.strictEqual(candleSpy.getCalls().length, expected);

			const doneSpy = sinon.spy(() => {});

			controller.on("done", doneSpy);

			controller.emit("stop");

			assert(doneSpy.calledOnce);

			clock.restore();
		});
	}

	it(`should create and cancel an order each candle`, async () => {
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

		const controller = await paperTrade({
			simulatedExchange,
			period: "1m",
			pair: "ETH/BTC",
			strategy,
		});

		controller.emit("start");

		await clock.tickAsync(120 * 60 * 1000);

		const doneSpy = sinon.spy((res) => {});

		controller.on("done", doneSpy);

		controller.emit("stop");

		assert(doneSpy.calledOnce);

		const result = doneSpy.getCall(0).args[0];

		const strategyCalls = strategy.getCalls().length;
		const exchangeFees = simulatedExchange.exchange.fees.trading.taker;
		// Multiplying by 1 is obviously redundant here, but in general
		// should multiply by order cost
		const totalCost = exchangeFees * 1 * strategyCalls;

		assert(
			isCloseTo(
				result["balance"]["BTC"]["free"],
				initialBalance.ETH - totalCost,
				0.00001
			)
		);

		assert.strictEqual(doneSpy.getCalls().length, 1);
		clock.restore();
	});
});
