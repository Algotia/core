import { SimulatedExchangeResult } from "../../src/types";
import backtestTests from "./backtest";
import paperTradeTests from "./paperTrade";

const methodsTests = async (
	exchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await backtestTests(exchange, initialBalance);
	await paperTradeTests(exchange, initialBalance);
};

export default methodsTests
