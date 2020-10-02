import { SingleBackfillOptions, MultiBackfillOptions } from "../methods";

const isMultiBackfillOptions = (
	opts: SingleBackfillOptions | MultiBackfillOptions
): opts is MultiBackfillOptions => {
	return opts.type === "multi";
};

export default isMultiBackfillOptions;
