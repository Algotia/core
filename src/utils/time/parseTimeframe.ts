import { Timeframe } from "../../types";

const parseTimeframe = (timeframe: Timeframe) => {
	const amountStr = timeframe.match(/\d+/g)[0];
	const unitStr = timeframe.match(/[a-zA-Z]+/g)[0];

	const oneMinMs = 60000;
	const amount = Number(amountStr);
	let unit: number;
	let unitLabel: string;

	switch (unitStr) {
		case "m":
			unit = oneMinMs;
			unitLabel = "minute";
			break;
		case "h":
			unit = oneMinMs * 60;
			unitLabel = "hour";
			break;
		case "d":
			unit = oneMinMs * 60 * 24;
			unitLabel = "day";
			break;
		case "w":
			unit = oneMinMs * 60 * 24 * 7;
			unitLabel = "week";
			break;
		case "M":
			unit = oneMinMs * 60 * 24 * 7 * 4;
			unitLabel = "month";
			break;
	}

	const periodMS = amount * unit;

	return { amount, unit, unitLabel, periodMS };
};

export default parseTimeframe;
