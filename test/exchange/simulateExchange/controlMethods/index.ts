import { describe } from "petzl";
import { SimulatedExchangeResult } from "../../../../src/types";
import fillOrdersTests from "./fillOrders";
import flushStoreTests from "./flushStore";
import updateContextTests from "./updateContext";

const controlMethodTests = async (
	exchange: SimulatedExchangeResult,
	initalBalance: Record<string, number>
) => {
	await describe("simulated exchange control methods", async () => {
		await fillOrdersTests(exchange, initalBalance);
		await flushStoreTests(exchange);
		await updateContextTests(exchange);
	});
};

export default controlMethodTests;
