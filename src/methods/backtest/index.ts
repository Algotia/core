import {
	AnyAlgotia,
	SingleBacktestOptions,
	MultiBacktestOptions,
	isMultiBacktestOptions,
} from "../../types";
import backfill from "./backfill";

const isSingleBacktestOptions = (obj: any): obj is SingleBacktestOptions => {
	return !isMultiBacktestOptions(obj);
};

async function backtest<
	Algotia extends AnyAlgotia,
	Options extends SingleBacktestOptions
>(algotia: Algotia, options: Options);

async function backtest<
	Algotia extends AnyAlgotia,
	Options extends MultiBacktestOptions
>(algotia: Algotia, options: Options);

async function backtest<
	Algotia extends AnyAlgotia,
	Options extends SingleBacktestOptions | MultiBacktestOptions
>(algotia: Algotia, options: Options) {
	if (isMultiBacktestOptions(options)) {
		return await backfill(algotia, options);
	} else if (isSingleBacktestOptions(options)) {
		return await backfill(algotia, options);
	}
}

export default backtest;
