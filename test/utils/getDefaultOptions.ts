import { defaultOptions } from "../../src/types";
import { getDefaultOptions } from "../../src/utils";
import { test } from "../testUtils";
import assert from "assert";

const getDefaultOptionsTests = async () => {
	await test("Utils: getDefaultOptions - works as expected", async () => {
		const options = getDefaultOptions();

		assert.deepStrictEqual(options, defaultOptions);

		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({
			"1m": "1s",
		});

		assert.deepStrictEqual(options, defaultOptions);

		const newOptions = getDefaultOptions();

		assert.strictEqual(newOptions.pollingPeriodTable["1m"], "1s");
	});

	await test("Utils: getDefaultOptions - Fails on invalid environment variable", async () => {
		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({
			notValid: "input",
		});

		assert.throws(getDefaultOptions);
	});
};

export default getDefaultOptionsTests;
