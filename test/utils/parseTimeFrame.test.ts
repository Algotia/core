import { parseTimeframe } from "../../src/utils/";

describe("Parse time frame", () => {
	test("Works", () => {
		const { unit, amount, unitLabel } = parseTimeframe("1m");
		expect(unit).toStrictEqual(60000);
		expect(amount).toStrictEqual(1);
		expect(unitLabel).toStrictEqual("minute");
	});
});
