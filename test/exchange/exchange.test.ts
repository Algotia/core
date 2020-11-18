import { AllowedExchangeIDs, SimulatedExchangeResult } from "../../src/types";
import { mockExchange } from "../utils";
import exchangeHelperTests from "./exchangeHelpers";
import simulateExchangeTests from "./simulateExchange/";

describe("Simulated exchange methods", () => {
	let exchanges: SimulatedExchangeResult[] = [];

	const initialBalance = {
		ETH: 100,
		BTC: 100,
	} as const;

	beforeAll(async () => {
		for (const exchangeId of AllowedExchangeIDs) {
			const exchange = await mockExchange(exchangeId, initialBalance);
			exchanges.push(exchange);
		}
	});

	afterEach((done) => {
		for (const { flushStore } of exchanges) {
			flushStore();
		}
		done();
	});

	describe("Exchange methods", () => {
		simulateExchangeTests(exchanges, initialBalance)
	});

	describe("Exchange helpers", () => {
		exchangeHelperTests(exchanges, initialBalance)
	})
});
