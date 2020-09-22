import {
	Config,
	AllowedExchanges,
	ConfigError,
	ExchangeConfig
} from "../../types";

const checkExchangeIds = (exchangeConfig: ExchangeConfig): boolean => {
	return Object.keys(exchangeConfig).some((id: any) => {
		if (AllowedExchanges.includes(id)) return true;
		return false;
	});
};

const getBadExchangeIds = (exchangeConfig: ExchangeConfig): string[] => {
	return Object.keys(exchangeConfig).map((id: any) => {
		if (!AllowedExchanges.includes(id)) return id;
	});
};

const validateConfig = (config: Config): Config => {
	(() => {
		const { exchange } = config;

		const exchangeIdsAreValid = checkExchangeIds(exchange);

		if (!exchangeIdsAreValid) {
			const badExchangeIds = getBadExchangeIds(exchange);
			const errorStr = `The following exchanges are invalid ${badExchangeIds.toString()}`;
			throw new ConfigError(errorStr);
		}
	})();

	return config;
};

export default validateConfig;
