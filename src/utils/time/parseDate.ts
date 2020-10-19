const parseDate = (input: string | number | Date): number => {
	if (input instanceof Date) {
		return input.getTime();
	} else {
		const dateMs = new Date(input);
		if (!isNaN(dateMs.getTime())) {
			return dateMs.getTime();
		} else {
			//TODO: Create error type for this
			throw new Error(`Input ${input} is not a valid date.`);
		}
	}
};

export default parseDate;
