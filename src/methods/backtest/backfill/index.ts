import {
	AnyAlgotia,
	SingleBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
	ExchangeID,
	ProcessedBackfillOptions,
	BackfillOptions,
	Exchange,
} from "../../../types";
import { MultiBacktestOptions } from "../../../types/";
import fetchRecords from "./fetchRecords";
import {
	parseDate,
	getDefaultExchange,
	exchangeFactory,
	parseTimeframe,
} from "../../../utils";

// Overload functions so that backfill can return multiple types
// based on input (Opts)

async function backfill(
	algotia: AnyAlgotia,
	opts: SingleBacktestOptions,
	exchange?: ExchangeID
): Promise<SingleBackfillSet>;

async function backfill<Exchanges extends ExchangeID[]>(
	algotia: AnyAlgotia,
	opts: MultiBacktestOptions,
	exchanges: Exchanges
): Promise<MultiBackfillSet<Exchanges>>;

// Main backfill method
async function backfill<ExchangeIDs extends ExchangeID[]>(
	algotia: AnyAlgotia,
	opts: SingleBacktestOptions | MultiBacktestOptions,
	exchange?: ExchangeID,
	exchanges?: ExchangeIDs
): Promise<SingleBackfillSet | MultiBackfillSet<ExchangeIDs>> {
	try {
		if (isSingleBacktestOptions(opts)) {
			// Single Backfill

			const options = processFetchOptions(algotia, opts, exchange);

			return await fetchRecords(algotia, options);

			//TODO: retrieve records
		} else if (isMultiBacktestOptions(opts)) {
			// Multi Backfill
		}
	} catch (err) {
		throw err;
	}
}

const processFetchOptions = <Options extends BackfillOptions>(
	algotia: AnyAlgotia,
	options: Options,
	exchangeId: ExchangeID
): ProcessedBackfillOptions => {
	const { until, since, timeframe } = options;

	const sinceMs = parseDate(since);
	const untilMs = parseDate(until);

	let exchange: Exchange;
	if (!exchangeId) {
		exchange = getDefaultExchange(algotia);
	} else {
		exchange = exchangeFactory({ id: exchangeId });
	}

	const { periodMS } = parseTimeframe(timeframe);
	const recordsBetween = Math.floor((untilMs - sinceMs) / periodMS);

	return {
		...options,
		periodMS,
		recordsBetween,
		since: sinceMs,
		until: untilMs,
		exchange,
	};
};

export default backfill;
