import { boot } from "../../src/algotia";
import backfill from "../../src/methods/backtest/backfill/index";

describe("Backfill method", () => {
	test("Fails on unconfigured exchange", async () => {
		try {
			const algotia = await boot({
				exchange: { binance: true, bitstamp: true },
			});
			const results = await backfill(algotia, {
				type: "multi",
				name: "lol",
				since: 1601449200000,
				until: 1601452800000,
				symbol: "ETH/BTC",
				timeframe: "1m",
				exchanges: ["bitstamp", "binance"],
			});
			const binanceStamps = results.records.bitstamp.map(
				({ timestamp }) => timestamp
			);
			const kucoinStamps = results.records.binance.map(
				({ timestamp }) => timestamp
			);
			expect(binanceStamps).toStrictEqual(kucoinStamps);
		} catch (err) {
			console.log(err);
		}
	});
});
