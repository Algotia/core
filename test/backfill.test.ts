import { AllowedExchangeIDs, SimulatedExchangeResult } from "../src/types";
import { parsePeriod } from "../src/utils";
import { backfill } from "../src/exchange"
import { mockExchange } from "./utils";

const checkCandlesAreContinuous = (
	candles: any[],
	period: string,
	expectedSince: number
) => {
	const { periodMs } = parsePeriod(period);

	for (let i = 0; i < candles.length; i++) {
		const thisCandle = candles[i];

		if (i === 0) {
			expect(thisCandle.timestamp).toStrictEqual(expectedSince);
			continue;
		}

		const lastCandle = candles[i - 1];

		expect(lastCandle.timestamp).toStrictEqual(
			thisCandle.timestamp - periodMs
		);
	}
};

describe("Backfill", () => {
	let exchanges: SimulatedExchangeResult[] = [];
	beforeAll(async () => {
		for (const exchangeId of AllowedExchangeIDs) {
			const exchange = await mockExchange(exchangeId, {}, { price: 1 });
			exchanges.push(exchange);
		}
	});

	test("Short backfill works as expected (no pagination)", async () => {
		for (const { exchange } of exchanges) {
			try {
				//  1/1/2020 12:00 AM (GMT)
				const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

				//  1/2/2020 12:00 AM (GMT)
				const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

				const candles = await backfill(
					fromMs,
					toMs,
					"ETH/BTC",
					"1h",
					exchange
				);

				checkCandlesAreContinuous(candles, "1h", fromMs);

			} catch (err) {
				throw err;
			}
		}
	});

	test("Long backfill works as expected (pagination)", async () => {
		for (const { exchange } of exchanges) {
			try {
				const fromMs = new Date("1/1/2020 12:00 PM GMT").getTime();

				const toMs = new Date("1/4/2020 12:00 AM GMT").getTime();

				// 3600 minutes apart

				const candles = await backfill(
					fromMs,
					toMs,
					"ETH/BTC",
					"1m",
					exchange
				);

				expect(candles.length).toStrictEqual(3600)

				checkCandlesAreContinuous(candles, "1m", fromMs);
			} catch (err) {
				throw err;
			}
		}
	}, 100000);
});
