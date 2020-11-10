import { Options } from "./index";

const getDefaultOptions = (period: string, options?: Options): Options => {
	const defaultPollingPeriodTable = {
		"1m": "10s",
		"3m": "1m",
		"5m": "1m",
		"15m": "1m",
		"30m": "3m",
		"1h": "3m",
		"2h": "5m",
		"4h": "5m",
		"6h": "10m",
		"8h": "10m",
		"12h": "10m",
		"1d": "30m",
		"3d": "1h",
		"1w": "2h",
		"1M": "1d",
	};

	const withDefaults = Object.assign(
		{},
		{
			pollingPeriod: defaultPollingPeriodTable[period],
		},
		options
	);

	return withDefaults
};

export default getDefaultOptions;
