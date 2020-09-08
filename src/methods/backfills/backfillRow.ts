import { BackfillDocument } from "../../types";

function BackfillRow(data: BackfillDocument) {
	function format(timeMs: number) {
		return new Date(timeMs).toLocaleString();
	}
	const { name, period, pair, since, until, candles } = data;
	this["name"] = name;
	this.records = candles.length;
	this.period = period;
	this.pair = pair;
	this["since (formatted)"] = format(since);
	this["until (formatted)"] = format(until);
}

export default BackfillRow;
