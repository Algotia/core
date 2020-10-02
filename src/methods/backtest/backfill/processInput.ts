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
		const { since, until } = opts;

		// Normalize bitstamp behavior, figure out better place to do this
		if (id === "bitstamp") {
			return {
				...opts,
				since: parseDate(since) - 1,
				until: parseDate(until),
			};
		}
		return {
			...opts,
			since: parseDate(since),
			until: parseDate(until),
		};
	} catch (err) {
		throw err;
	}
};

export default processInput;
