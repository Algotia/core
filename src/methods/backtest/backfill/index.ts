import {
	AnyAlgotia,
	SingleBackfillSet,
	MultiBackfillSet,
	SingleBackfillOptions,
	MultiBackfillOptions,
	ExchangeID,
	OHLCV,
	isSingleBackfillOptions,
	isMultiBackfillOptions,
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
		debugLog("Backfilling records");

		if (isSingleBackfillOptions(options)) {
			// Single Backfill

			return await fetchRecords(algotia, options);

			//TODO: retrieve records
		} else if (isMultiBackfillOptions(options)) {
			const { exchanges } = options;
			let allRecords: Record<ExchangeID, OHLCV[]>;
			for (const exchangeId of exchanges) {
				const singleSet = await fetchRecords(algotia, options, exchangeId);
				allRecords = {
					...allRecords,
					[exchangeId]: singleSet,
				};
			}

			let dataLen: number;
			let multiSet: MultiBackfillSet = [];

			for (const exchangeId of exchanges) {
				const set = allRecords[exchangeId];
				if (!dataLen) {
					dataLen = set.length;
					continue;
				}
				if (dataLen !== set.length) {
					throw new Error(
						`Database contains corrupted data: set should be length ${dataLen} but is ${set.length}`
					);
				}
				dataLen = set.length;
			}

			for (let i = 0; i < dataLen; i++) {
				for (const exchangeId of exchanges) {
					multiSet[i] = {
						...multiSet[i],
						[exchangeId]: allRecords[exchangeId][i],
					};
				}
			}

			return multiSet;
		}
	} catch (err) {
		throw err;
	}
}

export default backfill;
