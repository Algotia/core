import { defaultOptions } from "../../src/types";
import { getDefaultOptions } from "../../src/utils";
import { it, describe, assert } from "quyz";

describe("getDefaultOptions", () => {
	it("should be able to set environment variables", () => {
		const options = getDefaultOptions();

		assert.deepStrictEqual(options, defaultOptions);

		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({
			"1m": "1s",
		});

		assert.deepStrictEqual(options, defaultOptions);

		const newOptions = getDefaultOptions();

		assert.strictEqual(newOptions.pollingPeriodTable["1m"], "1s");
		assert.notStrictEqual(options, newOptions);
	});

	it("should fail on invalid environment variable", () => {
		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({
			notValid: "input",
		});

		assert.throws(getDefaultOptions);
	});
});
