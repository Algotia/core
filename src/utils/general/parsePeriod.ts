interface ParsedPeriod {
	amount: number;
	unit: number;
	unitLabel: string;
	periodMs: number;
	cronExpression: string;
}

const parsePeriod = (period: string): ParsedPeriod => {
	const amountString = period.match(/\d+/g)[0];
	const unitString = period.match(/[a-zA-Z]+/g)[0];

	const oneSecondMs = 1000;
	const oneMinuteMs = oneSecondMs * 60;

	const amount = Number(amountString);

	let unit: number, unitLabel: string, cronExpression: string;

	switch (unitString) {
		case "s":
			unit = oneSecondMs;
			unitLabel = "seconds"
			cronExpression = `*/${amount} * * * * *`
			break;
		case "m":
			unit = oneMinuteMs;
			unitLabel = "minutes";
			cronExpression = `*/${amount} * * * *`
			break;
		case "h":
			unit = oneMinuteMs * 60;
			unitLabel = "hours";
			cronExpression = `0 */${amount} * * *`
			break;
		case "d":
			unit = oneMinuteMs * 60 * 24;
			unitLabel = "days";
			cronExpression = `0 0 */${amount} * *`
			break;
		case "w":
			unit = oneMinuteMs * 60 * 24 * 7;
			unitLabel = "weeks";
			cronExpression = `0 0 0 */${amount} *`
			break;
		case "M":
			unit = oneMinuteMs * 60 * 24 * 7 * 4;
			unitLabel = "months";
			cronExpression = `0 0 0 0 */${amount}`
			break;
	}

	const periodMs = amount * unit;

	return {
		amount,
		unit,
		unitLabel,
		periodMs,
		cronExpression
	};
};

export default parsePeriod;
