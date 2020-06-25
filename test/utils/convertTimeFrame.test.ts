import convertTimeFrame from "../../src/utils/convertTimeFrame";

test("Convert time frame", () => {
	const create = (str, unit, ammount) => ({ case: str, expects: { unit, ammount } });

	const timeframes = [create("15m", "minute", 15), create("1m", "minute", 1)];
	timeframes.forEach(frame => {
		expect(convertTimeFrame(frame.case)).toStrictEqual(frame.expects);
	});
});
