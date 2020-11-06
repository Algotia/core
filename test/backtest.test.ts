import backtest from "../src/methods/backtest";
import { getCandles } from "../src/utils";

describe("Backtest", () => {
	test("backtest", async () => {
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const candles = await getCandles(
			fromMs,
			toMs,
			"ETH/BTC",
			"1h",
			"binance"
		);

		const result = await backtest(
			candles,
			"binance",
			{
				ETH: 0,
				BTC: 0,
			},
			async (exchange, data) => {
				try {
					console.log(exchange.urls)
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
		// console.log(result);
	});
});
