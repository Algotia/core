import { backtest } from "../src/methods/";
import { backfill, simulateExchange } from "../src/utils";

describe("Backtest", () => {
	test("backtest", async () => {
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const simulatedExchange = simulateExchange('binance', {
			ETH: 0,
			BTC: 10
		})

		const candles = await backfill(
			fromMs,
			toMs,
			"ETH/BTC",
			"1h",
			simulatedExchange.exchange
		);

		const result = await backtest(
			simulatedExchange,
			candles,
			async (exchange, data) => {
				try {
					await exchange.createOrder(
						"ETH/BTC",
						"market",
						"buy",
						1
					);
				} catch (err) {
					throw err;
				}
			}
		);
		console.log(result);
	});
});
