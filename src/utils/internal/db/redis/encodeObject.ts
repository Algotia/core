import { stringifyObject } from "./index";
import flatten from "flat";

const encodeObject = (obj: any) => {
	const flattened = flatten(obj);
	const stringified = stringifyObject(flattened);
	return stringified;
};

export default encodeObject;
