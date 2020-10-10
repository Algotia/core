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
			debug: true,
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
				timeframe: "15m",
				type: "single",
				initialBalance: {
					BTC: 1,
					ETH: 0,
				},
				strategy: async (exchange, data) => {
					const balance = await exchange.fetchBalance();
					const totalETH = balance["ETH"].free;
					/* if (totalETH > 0) { */
					/* } */
					if (balance["BTC"].free > data.close * 50) {
						return await exchange.createOrder("ETH/BTC", "market", "buy", 50);
					} else {
						return await exchange.createOrder(
							"ETH/BTC",
							"market",
							"sell",
							totalETH
						);
					}
				},
			});
		} catch (err) {
			throw err;
		}
	});
});
