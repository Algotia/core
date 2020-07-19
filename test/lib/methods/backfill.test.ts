import { backfill, boot } from "../../../src/algotia";
import {
	convertDateInputToMs,
	convertPeriodToMs,
	msUnits
} from "../../../src/utils/index";
import { BackfillOptions, BackfillResults } from "../../../src/types/index";

const getLen = (backfillResult: BackfillResults): number =>
	backfillResult.records.length;
const getMsDiff = (backfillResult: BackfillResults): number => {
	const periodMs = convertPeriodToMs(backfillResult.period);
	return periodMs;
};

describe("Backfill", () => {
	test("24 hour backfill is correct", async () => {
		try {
			const bootData = await boot({
				exchange: {
					exchangeId: "bitfinex",
					apiKey: "badString",
					apiSecret: "secree",
					timeout: 8000
				}
			});
			const _24hrBackfillOptions: BackfillOptions = {
				since: "12/05/2019 12:00 PST",
				until: "12/06/2019 12:00 PST",
				pair: "BTC/USD",
				period: "1h",
				recordLimit: 100
			};

			const _24hrBackfillResults = await backfill(
				bootData,
				_24hrBackfillOptions
			);

			const len = getLen(_24hrBackfillResults);

			// Number of records is 24
			expect(_24hrBackfillResults.records.length).toStrictEqual(24);
			// First timestamp is equal to sinceInput
			expect(_24hrBackfillResults.records[0].timestamp).toStrictEqual(
				convertDateInputToMs(_24hrBackfillOptions.since)
			);
			// Last timestamp is one unit before untilInput
			expect(_24hrBackfillResults.records[len - 1].timestamp).toStrictEqual(
				convertDateInputToMs(_24hrBackfillOptions.until) -
					getMsDiff(_24hrBackfillResults)
			);
			// Period is the same as options
			expect(_24hrBackfillResults.period).toStrictEqual(
				_24hrBackfillOptions.period
			);
			// Pair is the same as options
			expect(_24hrBackfillResults.pair).toStrictEqual(
				_24hrBackfillOptions.pair
			);
			// Since input is saved as unix timestamp
			expect(_24hrBackfillResults.since).toStrictEqual(
				convertDateInputToMs(_24hrBackfillOptions.since)
			);
			// Until input is saved as unix timestamp
			expect(_24hrBackfillResults.until).toStrictEqual(
				convertDateInputToMs(_24hrBackfillOptions.until)
			);
		} catch (err) {
			fail(err);
		}
	}, 10000);
});
