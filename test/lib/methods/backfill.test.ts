import { backfill, boot } from "../../../src/algotia";
import {
	convertDateInputToMs,
	convertPeriodToMs
} from "../../../src/utils/index";
import { BackfillOptions, BackfillDocument } from "../../../src/types/index";

const getMsDiff = (document: BackfillDocument): number => {
	const periodMs = convertPeriodToMs(document.period);
	return periodMs;
};

describe("Backfill", () => {
	let bootData;

	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				exchangeId: "bitfinex",
				apiKey: "badString",
				apiSecret: "secree",
				timeout: 8000
			}
		});
	});

	test("1 month backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillOptions = {
			since: "1/01/2020",
			until: "2/01/2020",
			pair: "ETH/USD",
			period: "1h",
			recordLimit: 200
		};

		const OneMonthBackfillResults = await backfill(
			bootData,
			OneMonthBackfillOptions
		);

		expect(OneMonthBackfillResults.records.length).toStrictEqual(744);

		expect(OneMonthBackfillResults.records[0].timestamp).toStrictEqual(
			convertDateInputToMs(OneMonthBackfillOptions.since)
		);
		// Last timestamp is one unit before untilInput
		expect(
			OneMonthBackfillResults.records[
				OneMonthBackfillResults.records.length - 1
			].timestamp
		).toStrictEqual(
			convertDateInputToMs(OneMonthBackfillOptions.until) -
				getMsDiff(OneMonthBackfillResults)
		);
		// Period is the same as options
		expect(OneMonthBackfillResults.period).toStrictEqual(
			OneMonthBackfillOptions.period
		);
		// Pair is the same as options
		expect(OneMonthBackfillResults.pair).toStrictEqual(
			OneMonthBackfillOptions.pair
		);
		// Since input is saved as unix timestamp
		expect(OneMonthBackfillResults.since).toStrictEqual(
			convertDateInputToMs(OneMonthBackfillOptions.since)
		);
		// Until input is saved as unix timestamp
		expect(OneMonthBackfillResults.until).toStrictEqual(
			convertDateInputToMs(OneMonthBackfillOptions.until)
		);
	}, 10000);

	test("24 hour backfill is correct", async () => {
		try {
			const OneDayBackfillOptions: BackfillOptions = {
				since: "12/05/2019 12:00 PST",
				until: "12/06/2019 12:00 PST",
				pair: "BTC/USD",
				period: "1h",
				recordLimit: 100
			};

			const OneDayBackfillResults = await backfill(
				bootData,
				OneDayBackfillOptions
			);

			// Number of records is 24
			expect(OneDayBackfillResults.records.length).toStrictEqual(24);
			// First timestamp is equal to sinceInput
			expect(OneDayBackfillResults.records[0].timestamp).toStrictEqual(
				convertDateInputToMs(OneDayBackfillOptions.since)
			);
			// Last timestamp is one unit before untilInput
			expect(
				OneDayBackfillResults.records[OneDayBackfillResults.records.length - 1]
					.timestamp
			).toStrictEqual(
				convertDateInputToMs(OneDayBackfillOptions.until) -
					getMsDiff(OneDayBackfillResults)
			);
			// Period is the same as options
			expect(OneDayBackfillResults.period).toStrictEqual(
				OneDayBackfillOptions.period
			);
			// Pair is the same as options
			expect(OneDayBackfillResults.pair).toStrictEqual(
				OneDayBackfillOptions.pair
			);
			// Since input is saved as unix timestamp
			expect(OneDayBackfillResults.since).toStrictEqual(
				convertDateInputToMs(OneDayBackfillOptions.since)
			);
			// Until input is saved as unix timestamp
			expect(OneDayBackfillResults.until).toStrictEqual(
				convertDateInputToMs(OneDayBackfillOptions.until)
			);
		} catch (err) {
			fail(err);
		}
	}, 10000);

	afterAll(async () => {
		await bootData.client.close();
	});
});
