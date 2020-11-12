import { DefaultOptions, defaultOptions } from "../../types";

type AnyObj = Record<any, any>;

class EnvironmentVaribleError extends Error {
	constructor(name: string, expected: any, got: any) {
		super(
			`Error parsing environment variable ${name}: Expected object assignable to 
			\n \t ${expected} \n \t but got ${got}`
		);
	}
}
defaultOptions.pollingPeriodTable

const parseJSONorFail = (name: string, str: string, obj: AnyObj): AnyObj => {
	if (!str) return {};
	const keys = Object.keys(obj);
	const parsed = JSON.parse(str);
	const parsedKeys = Object.keys(parsed);
	parsedKeys.forEach((key) => {
		if (!keys.includes(key)) {
			throw new EnvironmentVaribleError(name, obj, str);
		}
	});

	return parsed
};


const getDefaultOptions = (): DefaultOptions => {
	//POLLING PERIOD
	const pollingPeriodTableEnvName = "ALGOTIA_POLLING_PERIOD_TABLE";
	const pollingPeriodTableEnv = process.env[pollingPeriodTableEnvName];
	const pollingPeriodTableDefault = defaultOptions.pollingPeriodTable;

	const pollingPeriodOverride = parseJSONorFail(
		pollingPeriodTableEnvName,
		pollingPeriodTableEnv,
		pollingPeriodTableDefault
	);

	const pollingPeriodTable = Object.assign(
		{},
		pollingPeriodTableDefault,
		pollingPeriodOverride
	);

	return {
		pollingPeriodTable,
	};
};

export default getDefaultOptions;
