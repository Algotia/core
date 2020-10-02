import {
	AnyAlgotia,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
	isMultiBackfillSet,
	isSingleBackfillSet,
} from "../../../types";

async function save(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions,
	records: SingleBackfillSet
);

async function save(
	algotia: AnyAlgotia,
	options: MultiBacktestOptions,
	records: MultiBackfillSet
);

async function save(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiBacktestOptions,
	records: SingleBackfillSet | MultiBackfillSet
) {
	try {
		if (isMultiBacktestOptions(options)) {
			if (isMultiBackfillSet(records)) {
				console.log(records);
			} else {
				throw new Error("Options is type multi but set is type single");
			}
		} else if (isSingleBacktestOptions(options)) {
			if (isSingleBackfillSet(records)) {
				console.log(records);
			} else {
				throw new Error("Options type is single but set type is multi");
			}
		}
	} catch (err) {
		throw err;
	}
}

export default save;
