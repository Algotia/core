import {
	boot,
	AnyAlgotia,
	MultiBackfillOptions,
	SingleBackfillOptions,
} from "../../src/algotia";
import backfill from "../../src/methods/backtest/backfill/index";
import { parseTimeframe } from "../../src/utils";
import subtractTimestamps from "../testUtils/subtractTimestamps";

describe("Backfill method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: { binance: true, bittrex: true, kucoin: true },
			debug: true,
		});
	});
	afterAll(() => {
		algotia.quit();
	});
	test("Single backfill works", async () => {
		try {
			const options: SingleBackfillOptions = {
				since: "1/01/2020",
				until: "1/02/2020 1:00 AM",
				pair: "ETH/BTC",
				timeframe: "15m",
			};

			const res = await backfill(algotia, options);

			expect(res.length).toStrictEqual(100);
			const { periodMS } = parseTimeframe(options.timeframe);
			for (let i = 0; i < res.length; i++) {
				const candle = res[i];
				const lastCandle = res[i - 1];

				if (i === 0) {
					const sinceMs = new Date(options.since).getTime();
					expect(candle.timestamp).toStrictEqual(sinceMs);
					continue;
				}

				expect(subtractTimestamps(candle, lastCandle)).toStrictEqual(periodMS);
			}
		} catch (err) {
			throw err;
		}
	});
	test("Multi backfill works", async () => {
		try {
			const options: MultiBackfillOptions = {
				since: "12/31/2019",
				until: "1/05/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "multi",
				exchanges: ["kucoin", "binance"],
			};

			const { periodMS } = parseTimeframe(options.timeframe);

			const res = await backfill(algotia, options);

			res.forEach((data, i) => {
				for (const exchange of options.exchanges) {
					const exchangeCandle = data[exchange];
					expect(data).toHaveProperty(exchange);
					expect(exchangeCandle).toHaveProperty("timestamp");
					expect(exchangeCandle).toHaveProperty("open");
					expect(exchangeCandle).toHaveProperty("high");
					expect(exchangeCandle).toHaveProperty("low");
					expect(exchangeCandle).toHaveProperty("close");
					expect(exchangeCandle).toHaveProperty("volume");
					if (i !== 0) {
						const lastExchangeCandle = res[i - 1][exchange];
						expect(
							subtractTimestamps(exchangeCandle, lastExchangeCandle)
						).toStrictEqual(periodMS);
					}
				}
			});
		} catch (err) {
			throw err;
		}
	});
});
