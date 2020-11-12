const parsePair = (pair: string): [base: string, quote: string] => {
	const [base, quote] = pair.split("/");
	return [base, quote];
};

export default parsePair;
