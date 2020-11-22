import { SimulatedExchangeResult } from "../../../src/types";
import controlMethodTests from "./controlMethods";
import simulatedExchangeMethodTests from "./simulatedMethods";

const simulateExchangeTests = async (
	exchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await simulatedExchangeMethodTests(exchange, initialBalance);
	await controlMethodTests(exchange, initialBalance);
};

export default simulateExchangeTests;
