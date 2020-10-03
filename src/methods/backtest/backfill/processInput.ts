import {
	BacktestOptions,
	ProcessedBackfillOptions,
	Exchange as IExchange,
} from "../../../types";

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

const processInput = <Exchange extends IExchange, Opts extends BacktestOptions>(
	exchange: Exchange,
	opts: Opts
): ProcessedBackfillOptions => {
	try {
		const { id } = exchange;
		const { until, since } = opts;

		let sinceMs: number;
		let untilMs: number;

		// normalize bitstamp fetchOHLCV behavior
		if (id === "bitstamp") {
			sinceMs = parseDate(since) - 1;
		} else {
			sinceMs = parseDate(since);
		}
		untilMs = parseDate(until);

		return {
			...opts,
			since: sinceMs,
			until: untilMs,
		};
	} catch (err) {
		throw err;
	}
};

export default processInput;
