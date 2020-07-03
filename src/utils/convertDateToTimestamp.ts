// This command take in a string and attempts to convert it into a date
// first tries to convert a JavaScript Date
// then tries a unix timestamp

// should probably create an interface for this
const convert = (input: any) => {
	const unixString = new Date(Number(input));
	const dateString = new Date(input);

	let formatted: Date;

	if (dateString.valueOf()) {
		formatted = dateString;
	} else if (unixString.valueOf()) {
		formatted = unixString;
	}

	const utcString = formatted.toUTCString();

	const parsedInput = Date.parse(utcString);

	return parsedInput;
};

export default convert;
