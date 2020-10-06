import {
	AnyAlgotia,
	SingleBackfillSet,
	MultiBackfillSet,
	ExchangeID,
	ProcessedBackfillOptions,
	BackfillOptions,
	SingleBackfillOptions,
	MultiBackfillOptions,
	Exchange,
} from "../../../types";
import fetchRecords from "./fetchRecords";
import {
	parseDate,
	getDefaultExchange,
	exchangeFactory,
	parseTimeframe,
	debugLog,
} from "../../../utils";

// Overload functions so that backfill can return multiple types
// based on input (Opts)
const isSingleBackfillOptions = (opts: any): opts is SingleBackfillOptions => {
	return opts.type === "single" || undefined;
};

const isMultiBackfillOptions = (opts: any): opts is MultiBackfillOptions => {
	return opts.type === "multi";
};

async function backfill<Opts extends SingleBackfillOptions>(
	algotia: AnyAlgotia,
	opts: Opts
): Promise<SingleBackfillSet>;

async function backfill<Opts extends MultiBackfillOptions>(
	algotia: AnyAlgotia,
	opts: Opts
): Promise<MultiBackfillSet<Opts>>;

// Main backfill method
async function backfill<
	Opts extends SingleBackfillOptions | MultiBackfillOptions
>(
	algotia: AnyAlgotia,
	opts: Opts
): Promise<SingleBackfillSet | MultiBackfillSet> {
	try {
		debugLog(algotia, "Starting backfill");

		if (isSingleBackfillOptions(opts)) {
			// Single Backfill
			const options = processFetchOptions(algotia, opts, opts.exchange);

			debugLog(algotia, {
				label: `processed backfill options (${options.exchange.id}): `,
				value: options,
			});

			return await fetchRecords(algotia, options);

			//TODO: retrieve records
		} else if (isMultiBackfillOptions(opts)) {
			let multiSet: MultiBackfillSet;
			for (const exchangeId of opts.exchanges) {
				const options = processFetchOptions(algotia, opts, exchangeId);

				debugLog(algotia, {
					label: `processed backfill options (${options.exchange.id}): `,
					value: options,
				});

				const singleSet = await fetchRecords(algotia, options);

				multiSet = {
					...multiSet,
					[exchangeId]: singleSet,
				};
			}
			return multiSet;
		}
	} catch (err) {
		throw err;
	}
}

const processFetchOptions = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
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
