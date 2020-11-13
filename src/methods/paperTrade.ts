import {
	SimulatedExchangeResult,
	SimulatedExchangeStore,
	Strategy,
} from "../types";
import { getLiveCandle, parsePeriod, roundTime, getDefaultOptions } from "../utils";
import { EventEmitter } from "events"


/** Paper trading is similar to live trading, but uses a simulated
* exchange instead of a real one.
*/
const paperTrade = async (
	simulatedExchange: SimulatedExchangeResult,
	period: string,
	pair: string,
	strategy: Strategy,
): Promise<{ start: () => void; stop: () => SimulatedExchangeStore }> => {
	try {

		const { pollingPeriodTable } = getDefaultOptions();
		const pollingPeriod = pollingPeriodTable[period]

		const { periodMs: strategyPeriodMs } = parsePeriod(period);
		const { periodMs: pollingPeriodMs } = parsePeriod(pollingPeriod);

		let timeouts = [];
		let intervals = [];

		const pollExchange = async (exchange: SimulatedExchangeResult) => {
			try {
				const candle = await getLiveCandle(
					period,
					pair,
					Date.now(),
					exchange.exchange
				);

				exchange.updateContext(candle.timestamp, candle.close);

				exchange.fillOrders(candle);
			} catch (err) {
				throw err;
			}
		};

		const executeStrategy = async (exchange: SimulatedExchangeResult) => {
			try {
				const candle = await getLiveCandle(
					period,
					pair,
					Date.now(),
					exchange.exchange
				);

				exchange.updateContext(candle.timestamp, candle.close);

				try {
					await strategy(exchange.exchange, candle);
				} catch (err) {
					exchange.store.errors.push(err.message);
				}

				exchange.fillOrders(candle);

				const pollingInterval = setInterval(
					pollExchange,
					pollingPeriodMs,
					exchange
				);

				intervals.push(pollingInterval);

				const stopPollingTimeout = setTimeout(() => {
					clearInterval(pollingInterval);
				}, strategyPeriodMs - pollingPeriodMs);

				timeouts.push(stopPollingTimeout);
			} catch (err) {
				throw err;
			}
		};

		const controller = new EventEmitter();

		controller.on("start", () => {
			const now = new Date();

			const msUntilNextCandle =
				roundTime(now, strategyPeriodMs, "ceil").getTime() -
				now.getTime();

			const startStrategyTimeout = setTimeout(async () => {
				const strategyInterval = setInterval(
					executeStrategy,
					strategyPeriodMs,
					simulatedExchange
				);

				intervals.push(strategyInterval);

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
			controller.emit("done");
		});

		const start = () => {
			controller.emit("start");
		};

		const stop = () => {
			controller.emit("stop");
			return simulatedExchange.store;
		};

		return { start, stop };
	} catch (err) {
		throw err;
	}
};

export default paperTrade;
