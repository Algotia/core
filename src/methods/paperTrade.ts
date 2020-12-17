import {
	SimulatedExchangeResult,
	pollingPeriodTable,
	PaperTradeOptions,
} from "../types";
import { parsePeriod, roundTime } from "../utils";
import { getLiveCandle } from "../exchangeHelpers";
import { EventEmitter } from "events";

interface PaperTradeOptions {
	simulatedExchange: SimulatedExchangeResult;
	period: string;
	pair: string;
	pollingPeriod?: string;
	strategy: Strategy;
}

/** Paper trading is like live trading, but uses a simulated
 * exchange instead of a real one. */
const paperTrade = async (
	options: PaperTradeOptions
): Promise<EventEmitter> => {
	const {
		simulatedExchange,
		period,
		pair,
		strategy,
		pollingPeriod: userPollingPeriod,
	} = options;

	let pollingPeriod: string;

	if (userPollingPeriod) {
		pollingPeriod = userPollingPeriod;
	} else {
		pollingPeriod = pollingPeriodTable[period];
	}

	const { periodMs: strategyPeriodMs } = parsePeriod(period);
	const { periodMs: pollingPeriodMs } = parsePeriod(pollingPeriod);

	let timeouts = [];
	let intervals = [];

	// Get fresh data from exchange and try to fill any open orders
	const pollExchange = async ({
		exchange,
		updateContext,
		fillOrders,
	}: SimulatedExchangeResult) => {
		const candle = await getLiveCandle(period, pair, exchange);

		updateContext(candle.timestamp, candle.close);
		fillOrders(candle);
	};

	// Call strategy, immediately try to fill any orders, and schedule polling.
	// Polling begins after 1 unit of the defined polling period (e.g. 1m, 4h, 1d)
	// will stop 1 unit before the next strategy call.
	const executeStrategy = async (
		simulatedExchange: SimulatedExchangeResult
	) => {
		const {
			exchange,
			store,
			updateContext,
			fillOrders,
		} = simulatedExchange;
		const candle = await getLiveCandle(period, pair, exchange);

		controller.emit("candle", candle);
		updateContext(candle.timestamp, candle.close);

		try {
			await strategy(exchange, candle);
		} catch (err) {
			store.errors.push(err.message);
		}

		controller.emit("strategy", simulatedExchange.store);
		fillOrders(candle);

		const pollingInterval = setInterval(
			pollExchange,
			pollingPeriodMs,
			simulatedExchange
		);

		intervals.push(pollingInterval);

		const stopPollingTimeout = setTimeout(() => {
			clearInterval(pollingInterval);
		}, strategyPeriodMs - pollingPeriodMs);

		timeouts.push(stopPollingTimeout);
	};

	const controller = new EventEmitter();

	controller.on("start", () => {
		const now = new Date();

		const msUntilNextCandle =
			roundTime(now, strategyPeriodMs, "ceil").getTime() - now.getTime();

		// Start calling strategy on the next strategy period.
		const startStrategyTimeout = setTimeout(async () => {
			// Call strategy every period
			const strategyInterval = setInterval(
				executeStrategy,
				strategyPeriodMs,
				simulatedExchange
			);
			intervals.push(strategyInterval);

			// Call strategy once on the first strategy period.
			await executeStrategy(simulatedExchange);
		}, msUntilNextCandle);

		timeouts.push(startStrategyTimeout);
	});

	controller.on("stop", () => {
		for (const timeout of timeouts) {
			clearTimeout(timeout);
		}

		for (const interval of intervals) {
			clearInterval(interval);
		}
		controller.emit("done", simulatedExchange.store);
	});

	return controller;
};

export default paperTrade;
