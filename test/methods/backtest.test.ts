import { boot, backtest } from "../../src/methods";

describe("Backtest method", () => {
	test("Works", async () => {
		try {
			const algotia = await boot({
				exchange: {
					binance: true,
				},
			});
			const results = await backtest(algotia, {
				since: "1/01/2020",
				until: "1/02/2020",
				symbol: "ETH/BTC",
				timeframe: "1h",
				strategy: () => {},
			});
		} catch (err) {
			console.log(err);
		}
	});
});
