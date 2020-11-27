import { SimulatedExchangeResult } from "../../src/types";
import backtestTests from "./backtest";
import paperTradeTests from "./paperTrade";
import { describe } from "petzl";

const methodsTests = async (
	exchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await describe("User facing methods", async () => {
		await backtestTests(exchange, initialBalance);
		await paperTradeTests(exchange, initialBalance);
	});
};

export default methodsTests;
