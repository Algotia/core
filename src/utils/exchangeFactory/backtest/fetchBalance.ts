import { parsePair } from "../../general";
import { Exchange as CcxtExchange, Params, Balances, Balance } from "ccxt";
import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";

type FetchBalance = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => CcxtExchange["fetchBalance"];

const createFetchBalance: FetchBalance = (algotia, options, exchange) => {
	return async function fetchBalance(params?: Params) {
		const splitPair = parsePair(options.pair);
		const balanceKeys = ["total", "used", "free"];

		let balance: Balances;
		for (const singleCurrency of splitPair) {
			const path = `${exchange.id}-balance:${singleCurrency}`;
			const balanceRaw = await algotia.redis.hgetall(path);
			let singleBalance: Balance;
			for (const key of balanceKeys) {
				singleBalance = {
					...singleBalance,
					[key]: Number(balanceRaw[key]),
				};
			}
			balance = {
				...balance,
				[singleCurrency]: singleBalance,
			};
		}
		balance.info = { ...balance };
		return balance;
	};
};

export default createFetchBalance;
