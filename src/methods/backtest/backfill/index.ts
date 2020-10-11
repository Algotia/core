import {
	AnyAlgotia,
	SingleBackfillSet,
	MultiBackfillSet,
	SingleBackfillOptions,
	MultiBackfillOptions,
	isSingle,
	isMulti,
} from "../../../types";
import { debugLog } from "../../../utils";
import fetchRecords from "./fetchRecords";

// Overload functions so that backfill can return multiple types
// based on input (Opts)

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
		debugLog(algotia, "Backfilling records");

		if (isSingle<SingleBackfillOptions>(options)) {
			// Single Backfill

			return await fetchRecords(algotia, options);

			//TODO: retrieve records
		} else if (isMulti<MultiBackfillOptions>(options)) {
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
