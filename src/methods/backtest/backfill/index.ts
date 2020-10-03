import {
	AnyAlgotia,
	Exchange,
	SingleBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
	OHLCV,
} from "../../../types";
import { MultiBacktestOptions } from "../../../types/";
import validate from "./validate";
import fetchRecords from "./fetchRecords";
import processInput from "./processInput";
import save from "./save";
import { getDefaultExchangeId } from "../../../utils";

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
		const { type, ...fetchOptions } = opts;
		validate(algotia, opts);
		const defaultExchangeId = getDefaultExchangeId(algotia.config);
		const exchange: Exchange = algotia.exchanges[defaultExchangeId];
		const processedOptions = processInput(exchange, fetchOptions);
		const records = await fetchRecords(exchange, processedOptions);
		await save(algotia, opts, records);

		return records;
	} else if (isMultiBacktestOptions(opts)) {
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
