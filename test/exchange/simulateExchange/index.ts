import {
	SimulatedExchangeResult,
} from "../../../src/types";
import cancelOrderTests from "./cancelOrder";
import createOrderTests from "./createOrder";
import editOrderTests from "./editOrder";
import controlMethodTests from "./controlMethods";

const simulateExchangeTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	describe("Control methods", () => {
		controlMethodTests(exchanges);
	});
	describe("Cancel order", () => {
		cancelOrderTests(exchanges, initialBalance);
	});

	describe("Create order", () => {
		createOrderTests(exchanges, initialBalance);
	});

	describe("Edit order", () => {
		editOrderTests(exchanges, initialBalance);
	});
};

export default simulateExchangeTests
