import { SimulatedExchangeResult } from "../../src/types";
import exchangeHelperTests from "./exchangeHelpers";
import simulateExchangeTests from "./simulateExchange/";

const exchangeTests = async (
	exchange: SimulatedExchangeResult,
	initalBalance: Record<string, number>
) => {
	await exchangeHelperTests(exchange, initalBalance);
	await simulateExchangeTests(exchange, initalBalance);
};

export default exchangeTests;
