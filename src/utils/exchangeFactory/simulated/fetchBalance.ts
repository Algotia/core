import {
	parsePair,
	parseRedisFlatObj,
	getBaseAndQuotePath,
} from "../../../utils";
import { Exchange as CcxtExchange, Params, Balances, Balance } from "ccxt";
import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";

type FetchBalance = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => CcxtExchange["fetchBalance"];

const createFetchBalance: FetchBalance = (algotia, options, exchange) => {
	return async function fetchBalance(params?: Params) {
		const splitPair = parsePair(options.asset);

		let balance: Balances;

		const paths = getBaseAndQuotePath(exchange.id, options.asset);

		for (let i = 0; i < splitPair.length; i++) {
			const singleCurrency = splitPair[i];
			const path = paths[i];
			const rawSingleCurrencyBalance = await algotia.redis.hgetall(path);
			const singleCurrencyBalance = parseRedisFlatObj<Balance>(
				rawSingleCurrencyBalance
			);
			balance = Object.assign({}, balance, {
				[singleCurrency]: singleCurrencyBalance,
			});
		}

		balance.info = { ...balance };

		return balance;
	};
};

export default createFetchBalance;
