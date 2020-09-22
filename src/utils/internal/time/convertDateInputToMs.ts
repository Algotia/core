// This function take in a string and attempts to convert it into a date
// first tries to convert a JavaScript Date
// then tries a unix timestamp

const convertDateInputToMs = (input: string): number => {
	let date: Date;
	const numFromInput = Number(input);

	const checkIfNan = (num: number): boolean => Object.is(NaN, num);

	if (checkIfNan(numFromInput)) {
		// Input is a string
		date = new Date(input);
	} else {
		// Input is a number
		date = new Date(numFromInput);
	}

	if (checkIfNan(date.valueOf())) {
		// Invalid date
		throw new Error(`Invalid date: ${input} is not a valid date`);
	} else {
		// Valid date
		const timestamp = date.getTime();
		return timestamp;
	}
};

export default convertDateInputToMs;
