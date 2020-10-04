import {
	AnyAlgotia,
	SingleBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
} from "../../../types";
import { MultiBacktestOptions } from "../../../types/";
import validate from "./validate";
import fetchRecords from "./fetchRecords";
import processInput from "./processInput";
import { exchangeFactory } from "../../../utils";

// Overload functions so that backfill can return multiple types
// based on input (Opts)

async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends SingleBacktestOptions
>(algotia: Algotia, opts: Opts): Promise<SingleBackfillSet>;

async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends MultiBacktestOptions
>(algotia: Algotia, opts: Opts): Promise<MultiBackfillSet<Opts>>;

// Main backfill method
async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends SingleBacktestOptions | MultiBacktestOptions
>(algotia: Algotia, opts: Opts): Promise<SingleBackfillSet | MultiBackfillSet> {
	if (isSingleBacktestOptions(opts)) {
		// Single Backfill

		validate(algotia, opts);

		const exchange = opts.exchange && exchangeFactory({ id: opts.exchange });

		const options = processInput(algotia, opts, exchange);

		return await fetchRecords(algotia, options);

		//TODO: retrieve records
	} else if (isMultiBacktestOptions(opts)) {
		// Multi Backfill
	}
}

export default backfill;
