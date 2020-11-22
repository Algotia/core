import { SimulatedExchangeResult } from "../../../src/types";
import backfillTests from "./backfill";

const exchangeHelperTests = async (
	singleExchange: SimulatedExchangeResult,
	initalBalance: Record<string, number>
) => {
	await backfillTests(singleExchange);
};

export default exchangeHelperTests;
