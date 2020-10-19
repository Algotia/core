import { SingleBackfillSet } from "../methods";

const isSingleBackfillSet = (set: any): set is SingleBackfillSet => {
	return set.length !== undefined;
};

export default isSingleBackfillSet;
