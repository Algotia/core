import {
	isExchangeID,
	isMultiBacktestingOptions,
	isSingleBacktestingOptions,
	MultiBacktestOptions,
	SingleBacktestOptions,
	ValidationError,
} from "../../types";
import { parsePair } from "../../utils";

const validate = <Opts extends SingleBacktestOptions | MultiBacktestOptions>(
	options: Opts,
) => {
	
	if (isSingleBacktestingOptions(options)) {
		if (options.exchange) {
			// If exchange was passed, make sure its valid
			if (!isExchangeID(options.exchange)) {
				throw new ValidationError(
					`exchange: Exchange ${options.exchange} is not a valid exchange ID.`
				);
			}
		}

		const splitPair = parsePair(options.asset);

		for (const asset in options.initialBalance) {
			// Make sure initial balance exists in pair
			// e.g.: "BTC/USD"
		    // {BTC: 1, USD: 1} GOOD
			// {ETH: 1, USD: 1} BAD
			// TODO: Ensure that the following situations throw errors:
			// {USD: 1, USD: 1}
			// {ETH: 1}
			// 
			if (!splitPair.includes(asset)) {
				throw new ValidationError(
					`initialBalance: Asset ${asset} is not a valid asset. Valid assets: ${splitPair}`
				);
			}
		}
	} else if (isMultiBacktestingOptions(options)) {
		for (const exchangeId of options.exchanges) {
			if (!isExchangeID(exchangeId)) {
				throw new ValidationError(
					`exchanges: Exchange ${exchangeId} is not a valid exchange ID.`
				);
			}
		}
		for (const exchangeId in options.initialBalances) {
			if (!isExchangeID(exchangeId)) {
				throw new ValidationError(
					`initialBalances: ${exchangeId} is not a valid exchange ID.`
				);
			} else {
				if (!options.exchanges.includes(exchangeId)) {
					throw new ValidationError(
						`initialBalances: ${exchangeId} is not cofigured for this backtest, configured exchanges: ${options.exchanges}`
					);
				}
			}
			const splitPair = parsePair(options.asset);
			for (const asset in options.initialBalances[exchangeId]) {
				if (!splitPair.includes(asset)) {
					throw new ValidationError(
						`initialBalances: Asset ${asset} is not a valid asset. Valid assets: ${splitPair}`
					);
				}
			}
		}
	}
	return options;
};

export default validate;
