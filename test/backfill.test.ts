import { backfill, parsePeriod, roundTime, simulateExchange } from "../src/utils";
import {mockExchange} from "./utils";

describe("Backfill", () => {
	const checkCandles = (
		candles: any[],
		period: string,
		expectedLength: number,
		expectedSince: number
	) => {
		const { periodMs } = parsePeriod(period);

		for (let i = 0; i < candles.length; i++) {
			const thisCandle = candles[i];

			expect(thisCandle).toHaveProperty("timestamp");
			expect(thisCandle).toHaveProperty("open");
			expect(thisCandle).toHaveProperty("high");
			expect(thisCandle).toHaveProperty("low");
			expect(thisCandle).toHaveProperty("close");
			expect(thisCandle).toHaveProperty("volume");

			if (i === 0) {
				const firstTimestamp = roundTime(new Date(thisCandle.timestamp), periodMs, "ceil") ;
				expect(thisCandle.timestamp).toStrictEqual(firstTimestamp.getTime())
				continue;
			}
			const lastCandle = candles[i - 1];

			expect(lastCandle.timestamp).toStrictEqual(
				thisCandle.timestamp - periodMs
			);
		}

		expect(candles.length).toStrictEqual(expectedLength);
	};

	test("Short backfill", async () => {
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		// 24 hours apart
		const { exchange } = mockExchange("binance", {});

		const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", exchange);

		checkCandles(candles, "1h", 24, fromMs);
	});

	test("Long backfill", async () => {
		const fromMs = new Date("1/1/2020 12:00 PM GMT").getTime();

		const toMs = new Date("1/4/2020 12:00 AM GMT").getTime();

		// 3600 minutes apart
		const { exchange } = mockExchange("binance", {});

		const candles = await backfill(
			fromMs,
			toMs,
			"ETH/BTC",
			"1m",
			exchange
		);

		checkCandles(candles, "1m", 3600, fromMs);
	}, 100000);
});
