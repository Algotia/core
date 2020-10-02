import {MultiBackfillDocument} from "../methods";

const isMultiOptions = (opts: any): opts is MultiBackfillDocument => {
	return opts.type === "multi";
};

export
