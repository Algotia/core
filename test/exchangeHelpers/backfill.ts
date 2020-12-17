import { parsePeriod } from "../../src/utils";
import { backfill } from "../../src/exchangeHelpers";
import { simulatedExchange } from "../../test-utils";
import { it, describe, assert } from "quyz";

const checkCandlesAreContinuous = (
	candles: any[],
	period: string,
	expectedSince: number
) => {
	const { periodMs } = parsePeriod(period);

	for (let i = 0; i < candles.length; i++) {
		const thisCandle = candles[i];

		if (i === 0) {
			assert.strictEqual(thisCandle.timestamp, expectedSince);
			continue;
		}

		const lastCandle = candles[i - 1];

		assert.strictEqual(
			lastCandle.timestamp,
			thisCandle.timestamp - periodMs
		);
	}
};

const backfillArgs = [
	{
		title: "Short backfill (no pagination)",
		from: new Date("1/1/2020 12:00 AM GMT").getTime(),
		to: new Date("1/2/2020 12:00 AM GMT").getTime(),
		timeframe: "1h",
	},
	{
		title: "Long backfill (pagination)",
		from: new Date("1/1/2020 12:00 PM GMT").getTime(),
		to: new Date("1/4/2020 12:00 AM GMT").getTime(),
		timeframe: "1m",
	},
];

describe("backfill", async () => {
	for (const args of backfillArgs) {
		it(
			({ title }) => title,
			async ({ from, to, timeframe }) => {
				const candles = await backfill(
					from,
					to,
					"ETH/BTC",
					timeframe,
					simulatedExchange.exchange
				);

				checkCandlesAreContinuous(candles, timeframe, from);
			},
			args
		);
	}
});
