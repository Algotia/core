import { convertPeriodToMs, msUnits } from "../../../src/utils/";

test("Convert time frame", () => {
	const create = (str: string, num: number) => ({
		case: str,
		expects: num
	});

	const timeframes = [
		create("15m", 15 * msUnits.minute),
		create("1m", 1 * msUnits.minute),
		create("6h", 6 * msUnits.hour),
		create("1d", 1 * msUnits.day)
	];
	timeframes.forEach((frame) => {
		expect(convertPeriodToMs(frame.case)).toStrictEqual(frame.expects);
	});
});
