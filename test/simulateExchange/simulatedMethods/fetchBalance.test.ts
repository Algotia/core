import { createInitialBalance } from "../../../src/utils";
import {
	simulatedExchange,
	initialBalance,
	reset,
} from "../../test-utils";

describe("fetch balance", () => {
	afterEach(() => {
		reset();
	});
	it(`should fetch balance`, async () => {
		const { exchange } = simulatedExchange;

		const balance = await exchange.fetchBalance();
		const formattedIntialBalance = createInitialBalance(initialBalance);

		expect(balance).toStrictEqual(formattedIntialBalance);

		for (const currency in initialBalance) {
			expect(balance[currency].free).toStrictEqual(
				initialBalance[currency]
			);
		}
	});
});
