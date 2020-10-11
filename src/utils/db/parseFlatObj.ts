import { unflatten } from "flat";

const parseRedisFlatObj = <T>(obj: Record<string, string>): T => {
	let parsedObj: T;
	for (const key in obj) {
		const prop = obj[key];
		const num = Number(prop);
		let value: string | number;
		if (num) {
			value = num;
		} else {
			value = prop;
		}
		parsedObj = {
			...parsedObj,
			[key]: value,
		};
	}

	const parsed: T = unflatten(parsedObj);
	return parsed;
};

export default parseRedisFlatObj;
