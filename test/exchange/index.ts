import { SimulatedExchangeResult } from "../../src/types";
import exchangeHelperTests from "./exchangeHelpers";
import simulateExchangeTests from "./simulateExchange/";

const exchangeTests = async (
	exchange: SimulatedExchangeResult,
	initalBalance: Record<string, number>
) => {
	await simulateExchangeTests(exchange, initalBalance);
	await exchangeHelperTests(exchange, initalBalance);
};

export default exchangeTests;
