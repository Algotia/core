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
import {
	parseDate,
	parseTimeframe,
	debugLog,
	getDefaultExchange,
} from "../../../utils";
import fetchRecords from "./fetchRecords";

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
	options: Opts
): Promise<SingleBackfillSet>;

async function backfill<Opts extends MultiBackfillOptions>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<MultiBackfillSet<Opts>>;

// Main backfill method
async function backfill<
	Opts extends SingleBackfillOptions | MultiBackfillOptions
>(
	algotia: AnyAlgotia,
	options: Opts
): Promise<SingleBackfillSet | MultiBackfillSet> {
	try {
		debugLog(algotia, "Starting backfill");

		if (isSingleBackfillOptions(options)) {
			// Single Backfill

			return await fetchRecords(algotia, options);

			//TODO: retrieve records
		} else if (isMultiBackfillOptions(options)) {
			let multiSet: MultiBackfillSet;
			for (const exchangeId of options.exchanges) {
				const singleSet = await fetchRecords(algotia, options, exchangeId);
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

export default backfill;
