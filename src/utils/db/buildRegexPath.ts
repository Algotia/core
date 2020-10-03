const buildRegexPath = (...args: string[]) => {
	const basePath = ",exchanges,";

	let path = basePath;

	const cleanString = (str: string) => {
		return str;
	};
	args.forEach((arg) => {
		const str = cleanString(arg);
		path += `${str},`;
	});
	return path;
};

export default buildRegexPath;
