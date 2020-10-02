import {
	SingleBackfillOptions,
	MultiBackfillOptions,
	isMultiBackfillOptions,
	AnyAlgotia,
} from "../../types";

const validate = <T extends AnyAlgotia>(
	algotia: T,
	opts: SingleBackfillOptions | MultiBackfillOptions
) => {
	if (!isMultiBackfillOptions(opts)) {
	} else if (isMultiBackfillOptions(opts)) {
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
