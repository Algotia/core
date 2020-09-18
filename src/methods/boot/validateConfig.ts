import { Config, AllowedExchanges, ConfigError } from "../../types";

const validateConfig = (config: Config): Config => {
	(() => {
		const allConfigExchages = Object.keys(config.exchange);
		let badExchangeIds = [];

		const configsAreAllowed = allConfigExchages.some((id: any) => {
			if (AllowedExchanges.includes(id)) {
				return true;
			} else {
				badExchangeIds.push(id);
			}
		});

		if (!configsAreAllowed) {
			let errorStr: string;
			if (badExchangeIds.length === AllowedExchanges.length) {
				errorStr =
					"You must have at least one valid exchange as a property of exchange";
			} else {
				errorStr =
					"The following exchanges have invalid IDs (property names): ";
				errorStr += badExchangeIds.reduce(
					(a, b, i) => (a += i === badExchangeIds.length ? b : b + ", "),
					""
				);
			}
			throw new ConfigError(errorStr);
		}

		//if (exchange.timeout < 3000) {
		//throw new ConfigError(
		//`The timeout in your configuration file (${timeout}}) is too short. Please make it a value above 3000`
		//);
		//}
	})();

	return config;
};

export default validateConfig;
