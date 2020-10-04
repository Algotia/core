import {
	BacktestOptions,
	ProcessedBackfillOptions,
	Exchange,
	AnyAlgotia,
} from "../../../types";
import { parseTimeframe, getDefaultExchange } from "../../../utils";

const parseDate = (input: string | number | Date): number => {
	if (input instanceof Date) {
		return input.getTime();
	} else {
		const dateMs = new Date(input);
		if (!isNaN(dateMs.getTime())) {
			return dateMs.getTime();
		} else {
			//TODO: Create error type for this
			throw new Error(`Input ${input} is not a valid date.`);
		}
	}
};

const processInput = (
	algotia: AnyAlgotia,
	opts: BacktestOptions,
	exchange?: Exchange
): ProcessedBackfillOptions => {
	try {
		const { until, since, timeframe } = opts;

		let sinceMs: number;
		let untilMs: number;

		if (!exchange) {
			exchange = getDefaultExchange(algotia);
		}

		const { id } = exchange;

		// normalize bitstamp fetchOHLCV behavior
		if (id === "bitstamp") {
			sinceMs = parseDate(since) - 1;
		} else {
			sinceMs = parseDate(since);
		}
		untilMs = parseDate(until);

		console.log("TMF ", timeframe);
		const { unit, amount } = parseTimeframe(timeframe);
		console.log("U A ", unit, amount);
		const periodMS = unit * amount;
		console.log("PMS ", periodMS);
		const recordsBetween = Math.floor((untilMs - sinceMs) / periodMS);

		return {
			...opts,
			periodMS,
			recordsBetween,
			since: sinceMs,
			until: untilMs,
			exchange,
		};
	} catch (err) {
		throw err;
	}
};

export default processInput;
