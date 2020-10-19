import { parsePair } from "../../general";
import { Exchange as CcxtExchange, Params, Balances, Balance } from "ccxt";
import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";
import { getBaseAndQuotePath, parseRedisFlatObj } from "../../db";
import observe from "inquirer/lib/utils/events";

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

		const paths = getBaseAndQuotePath(exchange.id, options.pair);
		/* for (const path of paths) { */
		/* 	const rawSingleCurrencyBalance = await algotia.redis.hgetall(path); */
		/* 	const singleCurrencyBalance = parseRedisFlatObj<Balance>( */
		/* 		rawSingleCurrencyBalance */
		/* 	); */
		/* 	balance = Object.assign({}, balance, { singleCurrencyBalance }); */
		/* } */

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

		/* for (const singleCurrency of splitPair) { */
		/* 	const path = `${exchange.id}-balance:${singleCurrency}`; */
		/* 	const balanceRaw = await algotia.redis.hgetall(path); */
		/* 	let singleBalance: Balance; */
		/* 	for (const key of balanceKeys) { */
		/* 		singleBalance = { */
		/* 			...singleBalance, */
		/* 			[key]: Number(balanceRaw[key]), */
		/* 		}; */
		/* 	} */
		/* 	balance = { */
		/* 		...balance, */
		/* 		[singleCurrency]: singleBalance, */
		/* 	}; */
		/* } */
		balance.info = { ...balance };
		return balance;
	};
};

export default createFetchBalance;
