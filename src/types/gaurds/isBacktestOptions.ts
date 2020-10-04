import { SingleBacktestOptions, MultiBacktestOptions } from "../methods";

const isMultiBacktestOptions = (
	opts: SingleBacktestOptions | MultiBacktestOptions
): opts is MultiBacktestOptions => {
	if (opts.type && opts.type === "multi") {
		return true;
	} else {
		return false;
	}
};

const isSingleBacktestOptions = (
	opts: SingleBacktestOptions | MultiBacktestOptions
): opts is SingleBacktestOptions => {
	return !isMultiBacktestOptions(opts);
};

export { isMultiBacktestOptions, isSingleBacktestOptions };
