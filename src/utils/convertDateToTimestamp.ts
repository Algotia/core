// This function take in a string and attempts to convert it into a date
// first tries to convert a JavaScript Date
// then tries a unix timestamp

export default (input: string): number => {
	const numFromInput = Number(input);

	let date: Date;

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
		return 0;
	} else {
		// Valid date
		const timestamp = date.getTime();
		return timestamp;
	}
};
