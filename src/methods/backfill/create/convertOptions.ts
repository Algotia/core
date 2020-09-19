import { convertPeriodToMs, convertDateInputToMs } from "../../../utils/index";
import {
	ConvertedBackfillOptions,
	BackfillInput,
	SingleExchange
} from "../../../types";

// Converts input into friendly format

const convertOptions = (
	backfillOptions: BackfillInput,
	exchange: SingleExchange
): ConvertedBackfillOptions => {
	const { since, until, period, recordLimit } = backfillOptions;

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
	let defaultRecordLimit: number;
	if (!recordLimit) {
		defaultRecordLimit = exchange.historicalRecordLimit;
	}

	const convertedOptions = {
		...backfillOptions,
		untilMs,
		sinceMs,
		periodMs,
		recordsToFetch,
		recordLimit: defaultRecordLimit
	};
	return convertedOptions;
};

export default convertOptions;
