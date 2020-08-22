import { backfill, boot } from "../../../src/algotia";
import {
	convertDateInputToMs,
	convertPeriodToMs,
	log
} from "../../../src/utils/index";
import {
	BackfillInput,
	BackfillDocument,
	BootData
} from "../../../src/types/index";

const getMsDiff = (document: BackfillDocument): number => {
	const periodMs = convertPeriodToMs(document.period);
	return periodMs;
};

describe("Backfill", () => {
	let bootData: BootData;

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
			until: "2/01/2020",
			pair: "ETH/BTC",
			period: "1h",
			verbose: true
		};

		const OneMonthBackfillResults = await backfill(
			bootData,
			OneMonthBackfillOptions
		);

		expect(OneMonthBackfillResults.userCandles.length).toStrictEqual(744);
		expect(OneMonthBackfillResults.internalCandles.length).toStrictEqual(
			744 * 60
		);

		if (bootData.config.exchange.exchangeId === "bitstamp") {
			expect(OneMonthBackfillResults.userCandles[0].timestamp).toStrictEqual(
				convertDateInputToMs(OneMonthBackfillOptions.since) +
					getMsDiff(OneMonthBackfillResults)
			);
		} else {
			expect(OneMonthBackfillResults.userCandles[0].timestamp).toStrictEqual(
				convertDateInputToMs(OneMonthBackfillOptions.since)
			);
		}
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

	//test("24 hour backfill is correct", async () => {
	//try {
	////const OneDayBackfillOptions: BackfillInput = {
	////since: "12/05/2019 12:00 PST",
	////until: "12/06/2019 12:00 PST",
	////pair: "BTC/USD",
	////period: "1h",
	////recordLimit: 100
	////};

	////const OneDayBackfillResults = await backfill(
	////bootData,
	////OneDayBackfillOptions
	////);

	////// Number of records is 24
	////expect(OneDayBackfillResults.userCandles.length).toStrictEqual(24);
	////expect(OneDayBackfillResults.internalCandles.length).toStrictEqual(
	////24 * 60
	////);
	////// First timestamp is equal to sinceInput
	////expect(OneDayBackfillResults.userCandles[0].timestamp).toStrictEqual(
	////convertDateInputToMs(OneDayBackfillOptions.since)
	////);
	////// Last timestamp is one unit before untilInput
	////expect(
	////OneDayBackfillResults.userCandles[
	////OneDayBackfillResults.userCandles.length - 1
	////].timestamp
	////).toStrictEqual(
	////convertDateInputToMs(OneDayBackfillOptions.until) -
	////getMsDiff(OneDayBackfillResults)
	////);
	////// Period is the same as options
	////expect(OneDayBackfillResults.period).toStrictEqual(
	////OneDayBackfillOptions.period
	////);
	////// Pair is the same as options
	////expect(OneDayBackfillResults.pair).toStrictEqual(
	////OneDayBackfillOptions.pair
	////);
	////// Since input is saved as unix timestamp
	////expect(OneDayBackfillResults.since).toStrictEqual(
	////convertDateInputToMs(OneDayBackfillOptions.since)
	////);
	////// Until input is saved as unix timestamp
	////expect(OneDayBackfillResults.until).toStrictEqual(
	////convertDateInputToMs(OneDayBackfillOptions.until)
	////);
	////} catch (err) {
	////fail(err);
	////}
	////}, 60000);
});
