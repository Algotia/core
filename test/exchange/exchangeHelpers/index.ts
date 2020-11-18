import { SimulatedExchangeResult } from "../../../src/types";
import backfillTests from "./backfill";
import backtestTests from "./backtest"
import paperTradeTests from "./paperTrade";

const exchangeHelperTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	backfillTests(exchanges)
	backtestTests(exchanges, initialBalance)
	paperTradeTests(exchanges, initialBalance)
};

export default exchangeHelperTests
