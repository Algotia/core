import { SingleBacktestOptions, MultiBacktestOptions } from "..";
import {
	isSingleBackfillOptions,
	isMultiBackfillOptions,
} from "./isBackfillOptions";

const isSingleBacktestingOptions = (
	options: any
): options is SingleBacktestOptions => {
	return isSingleBackfillOptions(options);
};

const isMultiBacktestingOptions = (
	options: any
): options is MultiBacktestOptions => {
	return isMultiBackfillOptions(options);
};

export { isSingleBacktestingOptions, isMultiBacktestingOptions };
