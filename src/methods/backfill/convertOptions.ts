import { convertPeriodToMs, convertDateInputToMs } from "../../utils/index";
import { ConvertedBackfillOptions, BackfillOptions } from "../../types";

// Converts input into friendly format

const convertOptions = (
	backfillOptions: BackfillOptions
): ConvertedBackfillOptions => {
	const { since, until, period } = backfillOptions;
	const sinceMs = convertDateInputToMs(since);
	const untilMs = convertDateInputToMs(until);

	const periodMs = convertPeriodToMs(period);
	const msBetween = untilMs - sinceMs;
	const recordsToFetch = Math.floor(msBetween / periodMs);

	const newProps = {
		sinceMs,
		untilMs,
		periodMs,
		msBetween,
		recordsToFetch
	};
	return Object.assign(backfillOptions, newProps);
};

export default convertOptions;
