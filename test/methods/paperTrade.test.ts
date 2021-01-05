import { paperTrade } from "../../src/algotia";
import { Exchange, Strategy, PaperTradeOptions } from "../../src/types";
import { simulatedExchange, reset, initialBalance } from "../test-utils";
import sinon from "sinon";
import { EventEmitter } from "events";

jest.mock("../../src/exchangeHelpers/getLiveCandle", () => {
	return jest.fn(() => {
		return {
			timestamp: 1000,
			open: 1,
			high: 1,
			low: 1,
			close: 1,
			volume: 1,
		};
	});
});
describe("paperTrade", () => {
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
		expect(controller).toBeInstanceOf(EventEmitter);
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
		test(title, async () => {
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

			expect(candleSpy.getCalls().length).toStrictEqual(expected);

			const doneFn = jest.fn();

			controller.on("done", doneFn);

			controller.emit("stop");

			expect(doneFn).toHaveBeenCalled();

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

		const doneFn = jest.fn();

		controller.on("done", doneFn);

		controller.emit("stop");

		expect(doneFn).toHaveBeenCalled();

		const results = doneFn.mock.calls[0][0];

		const strategyCalls = strategy.getCalls().length;
		const exchangeFees = simulatedExchange.exchange.fees.trading.taker;
		// Multiplying by 1 is obviously redundant here, but in general
		// should multiply by order cost

		const totalCost = exchangeFees * 1 * strategyCalls;

		expect(results["balance"]["BTC"]["free"]).toBeCloseTo(
			initialBalance.ETH - totalCost,
			0.00001
		);

		// expect(doneFn.getCalls().length).toStrictEqual(1);
		clock.restore();
	});
});
