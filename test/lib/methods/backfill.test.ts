import { backfill, boot } from "../../../src/algotia";
import {
	convertDateInputToMs,
	convertPeriodToMs,
	log
} from "../../../src/utils/index";
import { BackfillInput, BackfillDocument } from "../../../src/types/index";

const getMsDiff = (document: BackfillDocument): number => {
	const periodMs = convertPeriodToMs(document.period);
	return periodMs;
};

describe("Backfill", () => {
	let bootData;

	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				exchangeId: "binance",
				apiKey: "badString",
				apiSecret: "secree",
				timeout: 8000
			}
		});
	}, 1800000);

	afterAll(async () => {
		await bootData.client.close();
	});

	test("Bad input throws error", async () => {
		try {
			const BadInput: BackfillInput = {
				since: "1/01/2020",
				until: "1/01/2020",
				pair: "ETH/BTC",
				period: "1h",
				verbose: true
			};

			await expect(backfill(bootData, BadInput)).rejects.toThrowError();
		} catch (err) {
			log.error(err);
		}
	});

	test("1 month backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillInput = {
			since: "1/01/2020",
			until: "1/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			verbose: true
		};

		const OneMonthBackfillResults = await backfill(
			bootData,
			OneMonthBackfillOptions
		);

		expect(OneMonthBackfillResults.userCandles.length).toStrictEqual(24);
		expect(OneMonthBackfillResults.internalCandles.length).toStrictEqual(
			24 * 60
		);

		expect(OneMonthBackfillResults.userCandles[0].timestamp).toStrictEqual(
			convertDateInputToMs(OneMonthBackfillOptions.since)
		);
		// Last timestamp is one unit before untilInput
		expect(
			OneMonthBackfillResults.userCandles[
				OneMonthBackfillResults.userCandles.length - 1
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
	}, 90000);
});
