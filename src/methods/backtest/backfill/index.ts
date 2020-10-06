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
	isExchangeID,
	AllowedExchanges,
} from "../../../types";
import { MultiBacktestOptions } from "../../../types/";
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
const isMultiExchangeID = (
	arr: ExchangeID | ExchangeID[]
): arr is ExchangeID[] => {
	if (arr.length) {
		return true;
	}
};

async function backfill<
	Opts extends SingleBacktestOptions,
	ID extends ExchangeID
>(algotia: AnyAlgotia, opts: Opts, exchange?: ID): Promise<SingleBackfillSet>;

async function backfill<
	Opts extends MultiBacktestOptions,
	IDArr extends ExchangeID[]
>(
	algotia: AnyAlgotia,
	opts: Opts,
	exchanges: IDArr
): Promise<MultiBackfillSet<ExchangeID[]>>;

// Main backfill method
async function backfill<
	Opts extends SingleBacktestOptions | MultiBacktestOptions,
	AnyExchangeID extends ExchangeID[]
>(
	algotia: AnyAlgotia,
	opts: Opts,
	exchange?: ExchangeID,
	exchanges?: AnyExchangeID
): Promise<MultiBackfillSet<AnyExchangeID> | SingleBackfillSet> {
	try {
		debugLog(algotia, "Starting backfill");

		if (exchange) {
			if (isSingleBacktestOptions(opts) && isExchangeID(exchange)) {
				// Single Backfill
				const options = processFetchOptions(algotia, opts, exchange);

				debugLog(algotia, {
					label: `processed backfill options (${exchange}): `,
					value: options,
				});

				return await fetchRecords(algotia, options);

				//TODO: retrieve records
			} else if (isMultiBacktestOptions(opts)) {
				if (isMultiExchangeID(exchange)) {
					const promises: Promise<
						{
							[key in ExchangeID]?: SingleBackfillSet;
						}
					>[] = exchange.map(async (id: ExchangeID) => {
						const options = processFetchOptions(algotia, opts, id);

						debugLog(algotia, {
							label: `processed backfill options (${exchange}): `,
							value: options,
						});

						const candles = await fetchRecords(algotia, options);

						return { [id]: candles };
						/* records = { */
						/* 	...records, */
						/* 	[id]: candles, */
						/* }; */
					});
					const multiSet = await Promise.all(promises);

					const set: MultiBackfillSet<AnyExchangeID> = multiSet.reduce(
						(prev, next) => {
							return (prev = {
								...prev,
								...next,
							});
						}
					);
					return set;
				}
			}
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
