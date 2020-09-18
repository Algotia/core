import { unflatten } from "flat";

type FlatObject = {
	[key: string]: string;
};

const decodeObject = (flatObj: FlatObject): any => {
	let newObj: any = {};
	for (const key in flatObj) {
		if (flatObj.hasOwnProperty(key)) {
			const item = flatObj[key];
			let value: string | number;
			if (isNaN(Number(item))) {
				value = item;
			} else {
				value = Number(item);
			}
			newObj[key] = value;
		}
	}

	const decoded = unflatten(newObj);

	return decoded;
};

export default decodeObject;
