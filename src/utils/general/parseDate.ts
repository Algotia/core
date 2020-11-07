const parseDate = (input: Date | string | number): Date => {
	if (input instanceof Date) {
		return input
	}
	const date = new Date(input);

	if (isNaN(date.getTime())) {
		throw new Error(`Error parsing date: ${input} is not a valid input.`)

	}
}

export default parseDate
