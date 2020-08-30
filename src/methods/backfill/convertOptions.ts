import { convertPeriodToMs, convertDateInputToMs } from "../../utils/index";
import { ConvertedBackfillOptions, BackfillInput } from "../../types";
import { Exchange } from "ccxt";

// Converts input into friendly format

const convertOptions = (
	backfillOptions: BackfillInput,
	exchange: Exchange,
	internal?: boolean
): ConvertedBackfillOptions => {
	let options: BackfillInput;
	if (internal === true) {
		options = { ...backfillOptions };
		const newSince =
			convertDateInputToMs(backfillOptions.since) +
			convertPeriodToMs(backfillOptions.period);
		options.since = new Date(newSince).toISOString();
		const newUntil =
			convertDateInputToMs(backfillOptions.until) +
			convertPeriodToMs(backfillOptions.period);
		options.until = new Date(newUntil).toISOString();
		options.period = "1m";
	} else {
		options = { ...backfillOptions };
	}

	const { since, until, pair, period, recordLimit, verbose } = options;

	const periodMs = convertPeriodToMs(period);

	let sinceMs: number;
	let untilMs: number;

	if (exchange.id === "bitstamp") {
		sinceMs = convertDateInputToMs(since) - 1;
		untilMs = convertDateInputToMs(until) - 1;
	} else {
		sinceMs = convertDateInputToMs(since);
		untilMs = convertDateInputToMs(until);
	}

	const msBetween = untilMs - sinceMs;
	const recordsToFetch = Math.floor(msBetween / periodMs);

	const convertedOptions = {
		since,
		until,
		untilMs,
		sinceMs,
		period,
		periodMs,
		pair,
		recordLimit,
		recordsToFetch,
		verbose
	};
	return convertedOptions;
};

export default convertOptions;
