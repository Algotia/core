import { boot, backtest } from "../../src/methods";
import { AnyAlgotia } from "../../src/types";

describe("Backtest method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: {
				binance: true,
			},
		});
	});

	afterAll(async () => {
		algotia.quit();
	});

	test("works", () => {
		expect(1).toStrictEqual(1);
	});
});
