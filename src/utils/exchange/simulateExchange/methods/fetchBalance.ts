import { Exchange as CCXT_Exchange } from "ccxt";
import { SimulatedExchangeStore } from "../../../../types";

type FetchBalance = CCXT_Exchange["fetchBalance"];

const createFetchBalance = (store: SimulatedExchangeStore): FetchBalance => {
	return async () => {
		return store.balance
	}
};

export default createFetchBalance
