import {
	AnyAlgotia,
	SingleBacktestOptions,
	MultiBacktestOptions,
	isMultiBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	ExchangeID,
} from "../../types";
import backfill from "./backfill";

const isSingleBacktestOptions = (obj: any): obj is SingleBacktestOptions => {
	return !isMultiBacktestOptions(obj);
};

async function backtest(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions,
	exchange?: ExchangeID
): Promise<SingleBackfillSet>;

async function backtest<ExchangeIDs extends ExchangeID[]>(
	algotia: AnyAlgotia,
	options: MultiBacktestOptions,
	exchanges: ExchangeIDs
): Promise<MultiBackfillSet<ExchangeIDs>>;

async function backtest<ExchangeIDs extends ExchangeID[]>(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiBacktestOptions,
	exchange?: ExchangeID,
	exchanges?: ExchangeIDs
): Promise<SingleBackfillSet | MultiBackfillSet<ExchangeIDs>> {
	if (isMultiBacktestOptions(options)) {
		return await backfill(algotia, options, exchanges);
	} else if (isSingleBacktestOptions(options)) {
		return await backfill(algotia, options, exchange);
	}
}

export default backtest;
