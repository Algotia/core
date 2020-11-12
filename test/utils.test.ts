import { defaultOptions } from "../src/types/"
import {getDefaultOptions, parsePeriod, roundTime} from "../src/utils";

describe("getDefaultOptions", () => {

	test("Works as expected", () => {
		const options = getDefaultOptions()

		expect(options).toStrictEqual(defaultOptions)

		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({"1m": "1s"})

		expect(options).toStrictEqual(defaultOptions)

		const newOptions = getDefaultOptions();

		expect(newOptions.pollingPeriodTable["1m"]).toStrictEqual("1s")

	});

	test("Fails on invalid environment variable", () => {

		process.env["ALGOTIA_POLLING_PERIOD_TABLE"] = JSON.stringify({notValid: "input"})

		expect(getDefaultOptions).toThrow();

	})

});

describe("roundTime", () => {
	test("Works as expected", () => {
		// Naming
		// t(n) = Target timestamp
		// c(n) = ceiling timestamp
		// f(n) = floor timestamp
		// p(n) = period

		function check (target: Date, cielTime: Date, floorTime: Date, period: string) {
			const { periodMs } = parsePeriod(period)

			const cielRounded = roundTime(target, periodMs, "ceil")
			const floorRounded = roundTime(target, periodMs, "floor")

			expect(cielRounded).toStrictEqual(cielTime)
			expect(floorRounded).toStrictEqual(floorTime)

		}
		const t1 = new Date("1/01/2020 12:03 AM")
		const c1 = new Date("1/01/2020 12:05 AM")
		const f1 = new Date("1/01/2020 12:00 AM")
		const p1 = "5m"

		check(t1, c1, f1, p1)

		const t2 = new Date("1/01/2020 12:00:01 AM")
		const c2 = new Date("1/01/2020 12:15 AM")
		const f2 = new Date("1/01/2020 12:00 AM")
		const p2 = "15m"

		check(t2, c2, f2, p2)

		const t3 = new Date("1/01/2020 12:00:01 AM")
		const c3 = new Date("1/01/2020 1:00 AM")
		const f3 = new Date("1/01/2020 12:00 AM")
		const p3 = "1h"

		check(t3, c3, f3, p3)

	})
})
