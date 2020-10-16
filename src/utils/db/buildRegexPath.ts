const buildRegexPath = (...args: string[]) => {
	const basePath = ",exchanges,";

	let path = basePath;

	args.forEach((arg) => {
		path += arg + ",";
	});

	return new RegExp(path);
};

export default buildRegexPath;
