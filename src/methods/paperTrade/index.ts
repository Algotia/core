import { ExchangeID, Strategy } from "../../types";
import {
	fillOrders,
	getLiveCandle,
	parsePeriod,
	roundTime,
	simulateExchange,
} from "../../utils";
import { EventEmitter } from "events";
import schedule from "node-schedule";
import getDefaultOptions from "./getDefaultOptions";

export interface Options {
	pollingPeriod: string;
}

const paperTrade = async (
	exchangeId: ExchangeID,
	period: string,
	pair: string,
	initalBalance: Record<string, number>,
	strategy: Strategy,
	options?: Options
): Promise<EventEmitter> => {
	try {
		//TODO: Validate

		//Setup
		const { exchange, store, updateContext } = simulateExchange(
			exchangeId,
			initalBalance
		);

		const {
			periodMs: strategyPeriodMs,
			cronExpression: strategyCronExpression,
		} = parsePeriod(period);

		const defaultOptions = getDefaultOptions(period);
		const optionsWithDefaults = Object.assign({}, defaultOptions, options);

		const {
			periodMs: pollingPeriodMs,
			cronExpression: pollingCronExpression,
		} = parsePeriod(optionsWithDefaults.pollingPeriod);

		const getNearestStrategyTimestamp = (): number => {
			const now = new Date();
			return roundTime(now, strategyPeriodMs, "ceil").getTime();
		};

		const schedulePolling = () => {
			const nextTimestamp = getNearestStrategyTimestamp();

			schedule.scheduleJob(
				{
					rule: pollingCronExpression,
					end: nextTimestamp - pollingPeriodMs,
				},
				async () => {
					const candle = await getLiveCandle(
						period,
						pair,
						Date.now(),
						exchange
					);

					updateContext(Date.now(), candle.close);

					fillOrders(store, candle);
				}
			);
		};

		const executeStrategy = async function ({ exchange, store }) {
			try {
				const candle = await getLiveCandle(
					period,
					pair,
					Date.now(),
					exchange
				);

				updateContext(Date.now(), candle.close);

				await strategy(exchange, candle);

				await fillOrders(store, candle);

				schedulePolling();
			} catch (err) {
				store.errors.push(err.message);
			}
		}.bind(null, { exchange, store });

		const controller = new EventEmitter();

		controller.on("start", () => {
			const strategyScheduler = schedule.scheduleJob(
				{ rule: strategyCronExpression },
				executeStrategy
			);

			controller.on("stop", () => {
				strategyScheduler.cancel();
				controller.emit("done");
			});

			controller.on("done", () => {
				controller.emit("result", store);
			});
		});

		return controller;
	} catch (err) {
		throw err;
	}
};

export default paperTrade;
