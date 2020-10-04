import {
	AnyAlgotia,
	SingleBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
	ExchangeID,
} from "../../../types";
import { MultiBacktestOptions } from "../../../types/";
import validate from "./validate";
import fetchRecords from "./fetchRecords";
import processInput from "./processInput";

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
	if (isSingleBacktestOptions(opts)) {
		// Single Backfill

		validate(algotia, opts);

		const options = processInput(algotia, opts, exchange);

		return await fetchRecords(algotia, options);

		//TODO: retrieve records
	} else if (isMultiBacktestOptions(opts)) {
		// Multi Backfill
	}
}

export default backfill;
