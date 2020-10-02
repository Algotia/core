import {
	AnyAlgotia,
	Exchange,
	SingleBackfillOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBackfillOptions,
	OHLCV,
} from "../../types";
import { MultiBackfillOptions } from "../../types/";
import validate from "./validate";
import fetchRecords from "./fetchRecords";
import processInput from "./processInput";

// Overload functions so that backfill can return multiple types
// based on input (Opts)

type Backfill =
	| (<Algotia extends AnyAlgotia, Opts extends SingleBackfillOptions>(
			algotia: Algotia,
			opts: Opts
	  ) => Promise<SingleBackfillSet>)
	| (<Algotia extends AnyAlgotia, Opts extends MultiBackfillOptions>(
			algotia: Algotia,
			opts: Opts
	  ) => Promise<MultiBackfillSet<Opts>>);

async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends SingleBackfillOptions
>(algotia: Algotia, opts: Opts): Promise<SingleBackfillSet>;

async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends MultiBackfillOptions
>(algotia: Algotia, opts: Opts): Promise<MultiBackfillSet<Opts>>;

// Main backfill method
async function backfill<
	Algotia extends AnyAlgotia,
	Opts extends SingleBackfillOptions | MultiBackfillOptions
>(algotia: Algotia, opts: Opts): Promise<SingleBackfillSet | MultiBackfillSet> {
	if (!isMultiBackfillOptions(opts)) {
		// Single Backfill
		const { type, ...fetchOptions } = opts;
		validate(algotia, opts);
		const exchangeKeys = Object.keys(algotia.exchanges);
		const exchange: Exchange = algotia.exchanges[exchangeKeys[0]];
		const processedOptions = processInput(exchange, fetchOptions);
		const records = await fetchRecords(exchange, processedOptions);

		return {
			records,
		};
	} else if (isMultiBackfillOptions(opts)) {
		// Multi Backfill
		const { type, exchanges, ...fetchOptions } = opts;
		validate(algotia, opts);

		let records: Record<typeof exchanges[number], OHLCV[]>;

		await Promise.all(
			exchanges.map(async (id) => {
				const exchange = algotia.exchanges[id];
				const processedOptions = processInput(exchange, fetchOptions);
				const singleRecordSet = await fetchRecords(exchange, processedOptions);
				records = {
					...records,
					[id]: singleRecordSet,
				};
			})
		);

		return {
			records,
		};
	}
}

export default backfill;
