import { boot, backtest } from "../../src/methods";
import { AnyAlgotia } from "../../src/types";

describe("Backtest method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: {
				binance: true,
			},
		});
	});

	afterAll(async () => {
		algotia.quit();
	});
	test("Works", async () => {
		try {
			const t0 = performance.now();
			const res = await backtest(
				algotia,
				{
					since: "1/04/2020",
					until: "1/05/2020",
					symbol: "ETH/BTC",
					timeframe: "15m",
					type: "single",
					strategy: () => {},
				},
				"bittrex"
			);

			const t1 = performance.now();
			const timestamps = res.map(({ timestamp }) => timestamp);
			console.log(timestamps, res.length);
			console.log("BACKFILL TOOK ", (t1 - t0) / 1000);
		} catch (err) {
			console.log(err);
		}
	});
});
