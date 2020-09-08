import { convertPeriodToMs, convertDateInputToMs } from "../../utils/index";
import { ConvertedBackfillOptions, BackfillInput } from "../../types";
import { Exchange } from "ccxt";

// Converts input into friendly format

const convertOptions = (
	backfillOptions: BackfillInput,
	exchange: Exchange
): ConvertedBackfillOptions => {
	const { since, until, pair, period, recordLimit, verbose } = backfillOptions;

	const periodMs = convertPeriodToMs(period);

	let sinceMs: number;
	let untilMs: number;

	// Bitstamp fetches all records AFTER the input date
	// so we subtract 1ms to normalize the behavior to fetch
	// records SINCE (on or after) the input date
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
