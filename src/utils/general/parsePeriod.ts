interface ParsedPeriod {
	amount: number;
	unit: number;
	unitLabel: string;
	periodMs: number;
}

const parsePeriod = (period: string): ParsedPeriod => {
	const amountString = period.match(/\d+/g)[0];
	const unitString = period.match(/[a-zA-Z]+/g)[0];

	const oneMinuteMs = 60000;

	const amount = Number(amountString);

	let unit: number, unitLabel: string;

	switch (unitString) {
		case "m":
			unit = oneMinuteMs;
			unitLabel = "minute";
			break;
		case "h":
			unit = oneMinuteMs * 60;
			unitLabel = "hour";
			break;
		case "d":
			unit = oneMinuteMs * 60 * 24;
			unitLabel = "day";
			break;
		case "w":
			unit = oneMinuteMs * 60 * 24 * 7;
			unitLabel = "week";
			break;
		case "M":
			unit = oneMinuteMs * 60 * 24 * 7 * 4;
			unitLabel = "month";
			break;
	}

	const periodMs = amount * unit;

	return {
		amount,
		unit,
		unitLabel,
		periodMs,
	};
};

export default parsePeriod;
