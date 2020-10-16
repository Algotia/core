import { boot, backtest } from "../../src/methods";
import { AnyAlgotia } from "../../src/types";
import { debugLog } from "../../src/utils";
import { inspect } from "util";

describe("Backtest method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: {
				binance: true,
				kucoin: true,
			},
			debug: true,
		});
	});

	afterAll(async () => {
		algotia.quit();
	});

	test(" multi works", async () => {
		try {
			const res = await backtest(algotia, {
				since: "1/01/2020",
				until: "1/02/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "multi",
				exchanges: ["binance", "kucoin"],
				initialBalances: {
					kucoin: {
						eth: 1,
						btc: 1,
					},
					binance: {
						eth: 1,
						btc: 1,
					},
				},
				strategy: () => {},
			});
			expect(res).toBe(undefined);
		} catch (err) {
			throw err;
		}
	}, 100000);
	test("works", async () => {
		try {
			const res = await backtest(algotia, {
				since: "1/08/2020",
				until: "1/09/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
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
					/* if (balance["BTC"].free > data.close * 50) { */
					const order = await exchange.createOrder(
						"ETH/BTC",
						"market",
						"buy",
						10
					);
					/* await exchange.cancelOrder(order.id); */
				},
			});
			expect(res).toHaveProperty("balance");
		} catch (err) {
			throw err;
		}
	}, 100000);
});
