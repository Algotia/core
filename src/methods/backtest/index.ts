import { AnyAlgotia } from "../../types";
import { SingleBacktestOptions } from "../../types/methods/backtest";

async function backtest<Options extends SingleBacktestOptions>(
	algotia: AnyAlgotia,
	options: Options
) {
	try {
	} catch (err) {
		throw err;
	}
}

export default backtest;
