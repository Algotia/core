import convertTimeFrame from "../../src/utils/convertTimeFrame";

test("Convert time frame", () => {
	const create = (str: string, unit: string, amount: number) => ({
		case: str,
		expects: { unit, amount }
	});

	const timeframes = [create("15m", "minute", 15), create("1m", "minute", 1)];
	timeframes.forEach((frame) => {
		expect(convertTimeFrame(frame.case)).toStrictEqual(frame.expects);
	});
});
