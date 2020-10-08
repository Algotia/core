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

	test("works", async () => {
		try {
			await backtest(algotia, {
				since: "1/01/2020",
				until: "1/02/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "single",
				initialBalance: {
					BTC: 100,
					ETH: 100,
				},
				strategy: async (exchange, data) => {
					try {
						await exchange.createOrder("ETH/BTC", "market", "buy", 1);
					} catch (err) {
						throw err;
					}
				},
			});
		} catch (err) {
			throw err;
		}
	});
});
