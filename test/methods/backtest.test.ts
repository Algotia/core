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
			await backtest(algotia, {
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
