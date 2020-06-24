export default (timeframe: string) => {
	const ammount = parseInt(timeframe.replace(/[^0-9\.]+/g, ""));

	let unit;

	switch (timeframe.replace(/[0-9]/g, "")) {
		case "m":
			unit = "minute";
			break;
		case "h":
			unit = "hour";
			break;
		case "d":
			unit = "day";
			break;
		case "w":
			unit = "week";
			break;
	}

	return { unit, ammount };
};
