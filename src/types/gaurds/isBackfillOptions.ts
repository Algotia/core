import { MultiBackfillOptions, SingleBackfillOptions } from "../methods";

const isMultiBackfillOptions = (obj: any): obj is MultiBackfillOptions => {
	if (obj.exchanges && obj.exchanges.length) return true;
};

const isSingleBackfillOptions = (obj: any): obj is SingleBackfillOptions => {
	if (!obj.exchange && !obj.exchanges) return true;
	if (obj.exchange && typeof obj.exchange === "string") return true;
};

export { isMultiBackfillOptions, isSingleBackfillOptions };
