import { SimulatedExchangeResult } from "../../../../src/types";
import cancelOrderTests from "./cancelOrder";
import createOrderTests from "./createOrder";
import editOrderTests from "./editOrder";
import { describe } from "petzl";

/* import createOrderTests from "./createOrder"; */
/* import editOrderTests from "./editOrder"; */
/* import controlMethodTests from "./controlMethods"; */

const simulatedExchangeMethodTests = async (
	exchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	/* describe("Control methods", () => { */
	/* 	controlMethodTests(exchanges); */
	/* }); */
	await describe("simulated exchange methods", async () => {
		await cancelOrderTests(exchange, initialBalance);
		await createOrderTests(exchange, initialBalance);
		await editOrderTests(exchange, initialBalance);
	});

	/* describe("Create order", () => { */
	/* 	createOrderTests(exchanges, initialBalance); */
	/* }); */

	/* describe("Edit order", () => { */
	/* 	editOrderTests(exchanges, initialBalance); */
	/* }); */
};

export default simulatedExchangeMethodTests;
