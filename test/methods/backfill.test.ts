import { boot, SingleBacktestOptions } from "../../src/algotia";
import backfill from "../../src/methods/backtest/backfill/index";
import { getBorderCharacters, table } from "table";
import { parseTimeframe } from "../../src/utils";

describe("Backfill method", () => {
	test("Fails on unconfigured exchange", async () => {
		try {
			const algotia = await boot({
				exchange: { binance: true },
			});

			const t0 = performance.now();
			const options: SingleBacktestOptions = {
				since: "1/01/2020",
				until: "1/02/2020 1:00 AM",
				symbol: "ETH/BTC",
				timeframe: "15m",
				type: "single",
				strategy: () => {},
			};
			const res = await backfill(algotia, options, "binance");

			const t1 = performance.now();
			const timestampsISO = res.map((ohlcv) => {
				const timestamp = new Date(ohlcv.timestamp).toISOString();
				return [timestamp];
			});
			const tab = table(timestampsISO, { border: getBorderCharacters("norc") });
			console.log(tab);
			console.log("BACKFILL TOOK ", (t1 - t0) / 1000);
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
});
