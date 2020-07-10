import ccxt from "ccxt";
import backfill from "../../../src/lib/commands/backfill";
import { convertDateToTimestamp, convertTimeFrame, msUnits } from "../../../src/utils/index";
import { BackfillOptions } from "../../../src/types/index";

const bitfinex = new ccxt.bitfinex({
	apiKey: "Te",
	secret: "lol",
	timeout: 5000
});

const getLen = (backfillResult): number => backfillResult.records.length;
const getMsDiff = (backfillResult): number => {
	const { unit, amount } = convertTimeFrame(backfillResult.period);
	const msDiff = msUnits[unit] * amount;
	return msDiff;
};

describe("Backfill", () => {
	test("24 hour backfill is correct", async () => {
		try {
			const _24hrBackfillOptions: BackfillOptions = {
				sinceInput: "12/05/2019 12:00 PST",
				untilInput: "12/06/2019 12:00 PST",
				pair: "BTC/USD",
				period: "1h",
				recordLimit: 100
			};

			const _24hrBackfillResults = await backfill(bitfinex, _24hrBackfillOptions);

			const len = getLen(_24hrBackfillResults);

			// Number of records is 24
			expect(_24hrBackfillResults.records.length).toStrictEqual(24);
			// First timestamp is equal to sinceInput
			expect(_24hrBackfillResults.records[0].timestamp).toStrictEqual(
				convertDateToTimestamp(_24hrBackfillOptions.sinceInput)
			);
			// Last timestamp is one unit before untilInput
			expect(_24hrBackfillResults.records[len - 1].timestamp).toStrictEqual(
				convertDateToTimestamp(_24hrBackfillOptions.untilInput) - getMsDiff(_24hrBackfillResults)
			);
			// Period is the same as options
			expect(_24hrBackfillResults.period).toStrictEqual(_24hrBackfillOptions.period);
			// Pair is the same as options
			expect(_24hrBackfillResults.pair).toStrictEqual(_24hrBackfillOptions.pair);
			// Since input is saved as unix timestamp
			expect(_24hrBackfillResults.since).toStrictEqual(
				convertDateToTimestamp(_24hrBackfillOptions.sinceInput)
			);
			// Until input is saved as unix timestamp
			expect(_24hrBackfillResults.until).toStrictEqual(
				convertDateToTimestamp(_24hrBackfillOptions.untilInput)
			);
		} catch (err) {
			fail(err);
		}
	}, 10000);
});
