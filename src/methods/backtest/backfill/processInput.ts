import {
	BacktestOptions,
	ProcessedBackfillOptions,
	AnyAlgotia,
	ExchangeID,
	Exchange,
} from "../../../types";
import {
	parseTimeframe,
	getDefaultExchange,
	parseDate,
	exchangeFactory,
} from "../../../utils";

const processInput = (
	algotia: AnyAlgotia,
	opts: BacktestOptions,
	exchangeId?: ExchangeID
): ProcessedBackfillOptions => {
	try {
		const { until, since, timeframe } = opts;

		let sinceMs: number;
		let untilMs: number;

		let exchange: Exchange;
		if (!exchangeId) {
			exchange = getDefaultExchange(algotia);
		} else {
			exchange = exchangeFactory({ id: exchangeId });
		}

		const { id } = exchange;

		// normalize bitstamp fetchOHLCV behavior
		if (id === "bitstamp") {
			sinceMs = parseDate(since) - 1;
		} else {
			sinceMs = parseDate(since);
		}
		untilMs = parseDate(until);

		const { unit, amount } = parseTimeframe(timeframe);
		const periodMS = unit * amount;
		const recordsBetween = Math.floor((untilMs - sinceMs) / periodMS);

		return {
			...opts,
			periodMS,
			recordsBetween,
			since: sinceMs,
			until: untilMs,
			exchange,
		};
	} catch (err) {
		throw err;
	}
};

export default processInput;
