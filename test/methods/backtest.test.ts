import { boot, backtest } from "../../src/methods";
import { AnyAlgotia } from "../../src/types";
import { getBorderCharacters, table } from "table";

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
					since: "1/03/2020 12:00 PM",
					until: "1/04/2020 12:00 PM",
					symbol: "ETH/BTC",
					timeframe: "15m",
					type: "single",
					strategy: () => {},
				},
				"binance"
			);

			const t1 = performance.now();
			const data = res.map((ohlcv) => {
				const timestamp = new Date(ohlcv.timestamp).toISOString();
				const formatted = {
					...ohlcv,
					timestamp,
				};
				return Array(...Object.values(formatted));
			});
			const tab = table(data, { border: getBorderCharacters("norc") });
			console.log(tab);
			console.log("BACKFILL TOOK ", (t1 - t0) / 1000);
		} catch (err) {
			console.log(err);
		}
	});
});
