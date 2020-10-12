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
			},
			debug: true,
		});
	});

	afterAll(async () => {
		algotia.quit();
	});

	test("works", async () => {
		try {
			const t0 = performance.now();
			const res = await backtest(algotia, {
				since: "1/01/2020",
				until: "1/02/2020",
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
			const t1 = performance.now();
			console.log("BACKFILL TOOK ", ((t1 - t0) / 1000).toFixed(3));
			console.log(inspect(res, false, 2));
		} catch (err) {
			throw err;
		}
	}, 100000);
});
