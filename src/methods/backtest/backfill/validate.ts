import {
	SingleBacktestOptions,
	MultiBacktestOptions,
	isMultiBacktestOptions,
	AnyAlgotia,
} from "../../../types";

const validate = <T extends AnyAlgotia>(
	algotia: T,
	opts: SingleBacktestOptions | MultiBacktestOptions
) => {
	if (!isMultiBacktestOptions(opts)) {
	} else if (isMultiBacktestOptions(opts)) {
		const optionsExchanges = opts.exchanges;
		const configuredExchanges = Object.keys(algotia.exchanges);
		const allExchangesConfigured = optionsExchanges.every((id) => {
			return configuredExchanges.includes(id);
		});
		if (!allExchangesConfigured) {
			throw new Error("NOT ALL EXCHANGES CONFIGURED");
		}
	}
};

export default validate;
