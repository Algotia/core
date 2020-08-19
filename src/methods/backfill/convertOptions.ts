import { convertPeriodToMs, convertDateInputToMs } from "../../utils/index";
import { ConvertedBackfillOptions, BackfillInput } from "../../types";

// Converts input into friendly format

const convertOptions = (
	backfillOptions: BackfillInput
): ConvertedBackfillOptions => {
	const { since, until, period, pair, recordLimit, verbose } = backfillOptions;
	const sinceMs = convertDateInputToMs(since);
	const untilMs = convertDateInputToMs(until);

	const periodMs = convertPeriodToMs(period);
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
