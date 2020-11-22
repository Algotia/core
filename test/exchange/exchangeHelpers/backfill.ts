import { SimulatedExchangeResult } from "../../../src/types";
import { parsePeriod } from "../../../src/utils";
import { backfill } from "../../../src/exchange";
import { test } from "../../testUtils";
import assert from "assert";

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

const backfillTests = async ({ exchange }: SimulatedExchangeResult) => {
	await test(`${exchange.id}: Short backfill (no pagination)`, async () => {
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", exchange);

		checkCandlesAreContinuous(candles, "1h", fromMs);
	});

	await test(`${exchange.id}: Long backfill (pagination)`, async () => {
		const fromMs = new Date("1/1/2020 12:00 PM GMT").getTime();

		const toMs = new Date("1/4/2020 12:00 AM GMT").getTime();

		// 3600 minutes apart

		const candles = await backfill(fromMs, toMs, "ETH/BTC", "1m", exchange);

		assert.strictEqual(candles.length, 3600);

		checkCandlesAreContinuous(candles, "1m", fromMs);
	});
};

export default backfillTests;
