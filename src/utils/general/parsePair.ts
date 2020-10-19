const parsePair = (pair: string): [string, string] => {
	const [base, quote] = pair.split("/");
	return [base, quote];
};

export default parsePair;
