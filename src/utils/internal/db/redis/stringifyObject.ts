type FlatObject = {
	[key: string]: any;
};

type StringifiedObject = {
	[key: string]: string;
};

const stringifyObject = (flatObj: FlatObject): StringifiedObject => {
	let stringObj = {};

	for (const key in flatObj) {
		if (flatObj.hasOwnProperty(key)) {
			stringObj[key] = flatObj[key].toString();
		}
	}

	return stringObj;
};

export default stringifyObject;
