import { parsePeriod, roundTime } from "../../src/utils";

interface TestObj {
	target: Date;
	cielTime: Date;
	floorTime: Date;
	period: string;
}

const check = (testObj: TestObj) => {
	const { target, cielTime, floorTime, period } = testObj;
	const { periodMs } = parsePeriod(period);

	const cielRounded = roundTime(target, periodMs, "ceil");
	const floorRounded = roundTime(target, periodMs, "floor");

	expect(cielRounded).toStrictEqual(cielTime);
	expect(floorRounded).toStrictEqual(floorTime);
};

describe("roundTime", () => {
	it("should round time correctly", () => {
		const dates: TestObj[] = [
			{
				target: new Date("1/01/2020 12:03 AM"),
				cielTime: new Date("1/01/2020 12:05 AM"),
				floorTime: new Date("1/01/2020 12:00 AM"),
				period: "5m",
			},
			{
				target: new Date("1/01/2020 12:00:01 AM"),
				cielTime: new Date("1/01/2020 12:15 AM"),
				floorTime: new Date("1/01/2020 12:00 AM"),
				period: "15m",
			},
			{
				target: new Date("1/01/2020 12:00:01 AM"),
				cielTime: new Date("1/01/2020 1:00 AM"),
				floorTime: new Date("1/01/2020 12:00 AM"),
				period: "1h",
			},
		];

		for (const obj of dates) {
			check(obj);
		}
	});
});
