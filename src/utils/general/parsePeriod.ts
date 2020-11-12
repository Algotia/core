interface ParsedPeriod {
	amount: number;
	unit: number;
	unitLabel: string;
	periodMs: number;
}

const parsePeriod = (period: string): ParsedPeriod => {
	const amountString = period.match(/\d+/g)[0];
	const unitString = period.match(/[a-zA-Z]+/g)[0];

	const oneSecondMs = 1000;
	const oneMinuteMs = oneSecondMs * 60;

	const amount = Number(amountString);

	let unit: number, unitLabel: string;

	switch (unitString) {
		case "s":
			unit = oneSecondMs;
			unitLabel = "seconds"
			break;
		case "m":
			unit = oneMinuteMs;
			unitLabel = "minutes";
			break;
		case "h":
			unit = oneMinuteMs * 60;
			unitLabel = "hours";
			break;
		case "d":
			unit = oneMinuteMs * 60 * 24;
			unitLabel = "days";
			break;
		case "w":
			unit = oneMinuteMs * 60 * 24 * 7;
			unitLabel = "weeks";
			break;
		case "M":
			unit = oneMinuteMs * 60 * 24 * 7 * 4;
			unitLabel = "months";
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
