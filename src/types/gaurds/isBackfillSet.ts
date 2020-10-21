import { SingleBackfillSet, MultiBackfillSet } from "../methods";
import isExchangeRecord from "./isExchangeRecord";

const isSingleBackfillSet = (set: any): set is SingleBackfillSet => {
	return set.length !== undefined && !isExchangeRecord(set[0]);
};

const isMultiBackfillSet = (set: any): set is MultiBackfillSet => {
	return isExchangeRecord(set[0]);
};

export { isSingleBackfillSet, isMultiBackfillSet };
