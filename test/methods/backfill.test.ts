import {
	boot,
	AnyAlgotia,
	MultiBackfillOptions,
	SingleBackfillOptions,
} from "../../src/algotia";
import backfill from "../../src/methods/backtest/backfill/index";
import { parseTimeframe } from "../../src/utils";

describe("Backfill method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: { binance: true, bittrex: true, kucoin: true },
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

			const { periodMS } = parseTimeframe(options.timeframe);
			for (let i = 0; i < res.length; i++) {
				const thisTimestamp = res[i].timestamp;

				if (i === 0) {
					const sinceMs = new Date(options.since).getTime();
					expect(thisTimestamp).toStrictEqual(sinceMs);
					continue;
				}

				const lastTimestamp = res[i - 1].timestamp;

				expect(thisTimestamp).toStrictEqual(lastTimestamp + periodMS);
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

			const res = await backfill(algotia, {
				since: "12/31/2019",
				until: "1/05/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "multi",
				exchanges: ["kucoin", "binance"],
			});

			res.forEach((data) => {
				for (const exchange of options.exchanges) {
					expect(data).toHaveProperty(exchange);
					expect(data[exchange]).toHaveProperty("timestamp");
					expect(data[exchange]).toHaveProperty("open");
					expect(data[exchange]).toHaveProperty("high");
					expect(data[exchange]).toHaveProperty("low");
					expect(data[exchange]).toHaveProperty("close");
					expect(data[exchange]).toHaveProperty("volume");
				}
			});
		} catch (err) {
			throw err;
		}
	});
});
