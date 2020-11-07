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

interface Options {
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
		const { exchange, store } = simulateExchange(exchangeId, initalBalance);

		const {
			periodMs: strategyPeriodMs,
			cronExpression: strategyCronExpression,
		} = parsePeriod(period);
		
		//TODO: APPLY DEFAULT OPTIONS
		//TODO: Create default pollingPeriod table
		const {
			periodMs: pollingPeriodMs,
			cronExpression: pollingCronExpression,
		} = parsePeriod(options.pollingPeriod);

		const getNearestStrategyTimestamp = (): number => {
			const now = new Date();
			return roundTime(now, strategyPeriodMs, "ceil").getTime();
		};

		const controller = new EventEmitter();

		//TODO: Validate

		controller.on("start", () => {
			const strategyScheduler = schedule.scheduleJob(
				{ rule: strategyCronExpression },
				async function ({ exchange, store }) {
					try {
						const candle = await getLiveCandle(
							period,
							pair,
							Date.now(),
							exchange
						);
						await strategy(exchange, candle);

						await fillOrders(store, candle)

						const nextTimestamp = getNearestStrategyTimestamp();

						schedule.scheduleJob(
							{
								rule: pollingCronExpression,
								start: Date.now() + pollingPeriodMs,
								end:
									nextTimestamp +
									strategyPeriodMs -
									pollingPeriodMs,
							},
							async () => {
								const candle = await getLiveCandle(
									period,
									pair,
									Date.now(),
									exchange
								)
								console.log("POLLED ", candle)
								store.currentPrice = candle.close;
								store.currentTime = Date.now()
								fillOrders(store, candle)
							}
						);
					} catch (err) {
						store.errors.push(err.message);
					}
				}.bind(null, { exchange, store })
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
