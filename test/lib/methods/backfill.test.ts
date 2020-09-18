import { backfill, boot } from "../../../src/algotia";
import { log } from "../../../src/utils/index";
import { BackfillInput, BootData, Config } from "../../../src/types/index";

describe("Backfill", () => {
	let bootData: BootData;
	beforeAll(async () => {
		const config: Config = {
			exchange: {
				binance: true,
				bitstamp: true
			}
		};
		bootData = await boot(config);
	}, 1800000);

	afterAll(async () => {
		bootData.quit();
	});

	test("Bad input throws error", async () => {
		try {
			const BadInput: BackfillInput = {
				since: "1/01/2020",
				until: "1/01/2020",
				pair: "ETH/BTC",
				period: "1h"
			};

			await expect(backfill(bootData, BadInput)).rejects.toThrowError();
		} catch (err) {
			log.error(err);
		}
	});

	test("1 month multi-backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "multi"
		};

		const OneMonthBackfillResults = await backfill(
			bootData,
			OneMonthBackfillOptions
		);

		const resultCandleLables = Object.keys(OneMonthBackfillResults.candles);
		const configCandleLabels = Object.keys(bootData.config.exchange);

		expect(resultCandleLables).toStrictEqual(configCandleLabels);

		const binanceCandles = OneMonthBackfillResults.candles["binance"];
		const bitstampCandles = OneMonthBackfillResults.candles["bitstamp"];

		expect(bitstampCandles.length).toStrictEqual(bitstampCandles.length);

		const lastBitstampCandle = bitstampCandles[bitstampCandles.length - 1];
		const lastBinanceCandle = binanceCandles[bitstampCandles.length - 1];

		expect(lastBinanceCandle.timestamp).toStrictEqual(
			lastBitstampCandle.timestamp
		);
		console.log(OneMonthBackfillResults.name);
	}, 100000);

	test("1 month single-backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h"
		};

		const OneMonthBackfillResults = await backfill(
			bootData,
			OneMonthBackfillOptions
		);

		expect(OneMonthBackfillResults.candles).toHaveLength(24);
		console.log(OneMonthBackfillResults.name);
	}, 100000);
});
