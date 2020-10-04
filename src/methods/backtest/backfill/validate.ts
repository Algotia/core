import {
	SingleBacktestOptions,
	MultiBacktestOptions,
	isMultiBacktestOptions,
	AnyAlgotia,
} from "../../../types";

const validate = <T extends AnyAlgotia>(
	algotia: T,
	opts: SingleBacktestOptions | MultiBacktestOptions
) => {
	// TODO: Validation
	if (!isMultiBacktestOptions(opts)) {
	} else if (isMultiBacktestOptions(opts)) {
	}
};

export default validate;
