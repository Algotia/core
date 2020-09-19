import { backfill, boot } from "../../src/algotia";
import {
	BackfillInput,
	BootData,
	Config,
	BackfillInputError,
	isSingleCandleSet
} from "../../src/types/index";
import { logger } from "../utils";

describe("Backfill", () => {
	let bootData: BootData;
	const { create } = backfill;
	beforeAll(async () => {
		const config: Config = {
			exchange: {
				binance: true,
				bitstamp: true
			}
		};
		bootData = await boot(config);
	}, 1800000);

	afterAll((done) => {
		bootData.quit();
		done();
	});

	test("Bad input throws error", async () => {
		const BadInput: BackfillInput = {
			since: "1/01/2020",
			until: "1/01/2020",
			pair: "ETH/BTC",
			period: "1h"
		};

		await expect(backfill.create(bootData, BadInput)).rejects.toThrowError();
	});

	test("1 month multi-backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "multi"
		};

		const OneMonthBackfillResults = await create(
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

		logger.info(
			`Backfill ${OneMonthBackfillResults.name} written to database.`
		);

		expect(lastBinanceCandle.timestamp).toStrictEqual(
			lastBitstampCandle.timestamp
		);
	}, 10000);

	test("1 month single-backfill is correct", async () => {
		const OneMonthBackfillOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h"
		};

		const OneMonthBackfillResults = await create(
			bootData,
			OneMonthBackfillOptions
		);
		expect(OneMonthBackfillResults.candles).toHaveLength(24);
		logger.info(
			`Backfill ${OneMonthBackfillResults.name} written to database.`
		);
	}, 100000);

	test("Backfills from different exchanges should have the same timestamps", async () => {
		const binanceOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "single",
			exchanges: ["binance"]
		};

		const bitstampOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "single",
			exchanges: ["bitstamp"]
		};

		const { candles: binanceCandles, name: binanceName } = await create(
			bootData,
			binanceOptions
		);
		const { candles: bitstampCandles, name: bitstampName } = await create(
			bootData,
			bitstampOptions
		);

		logger.info(`Backfill ${binanceName} written to database.`);
		logger.info(`Backfill ${bitstampName} written to database.`);

		if (
			isSingleCandleSet(binanceCandles) &&
			isSingleCandleSet(bitstampCandles)
		) {
			const binanceTimestamps = binanceCandles.map((c) => c.timestamp);
			const bitstampTimestamps = bitstampCandles.map((c) => c.timestamp);
			expect(binanceTimestamps).toStrictEqual(bitstampTimestamps);
		}
	}, 100000);

	test("Multi exchange should fail with one exchange configured", async () => {
		const badOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "multi",
			exchanges: ["binance"]
		};

		const results = create(bootData, badOptions);
		await expect(results).rejects.toThrowError(BackfillInputError);
	});

	test("Single exchange should fail with multiple exchanges passed", async () => {
		const badOptions: BackfillInput = {
			since: "2/01/2020",
			until: "2/02/2020",
			pair: "ETH/BTC",
			period: "1h",
			type: "single",
			exchanges: ["binance", "bitstamp"]
		};

		const results = create(bootData, badOptions);
		await expect(results).rejects.toThrowError(BackfillInputError);
	});
});
