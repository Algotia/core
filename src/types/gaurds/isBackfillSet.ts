import { MultiBackfillSet, SingleBackfillSet } from "../methods";
import { AllowedExchanges } from "../shared";

const isMultiBackfillSet = (
	set: SingleBackfillSet | MultiBackfillSet
): set is MultiBackfillSet => {
	return Object.keys(set).every((key: any) => {
		return AllowedExchanges.includes(key);
	});
};

const isSingleBackfillSet = (
	set: SingleBackfillSet | MultiBackfillSet
): set is SingleBackfillSet => {
	return !isMultiBackfillSet(set);
};

export { isMultiBackfillSet, isSingleBackfillSet };
