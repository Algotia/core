import { boot, backtest } from "../../src/methods";
import { AnyAlgotia } from "../../src/types";
import { debugLog } from "../../src/utils";

describe("Backtest method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: {
				binance: true,
			},
			debug: false,
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
					BTC: 0.05,
					ETH: 0,
				},
				strategy: async (exchange, data) => {
					await exchange.createOrder("ETH/BTC", "market", "buy", 1);
				},
			});
		} catch (err) {
			throw err;
		}
	});
});
