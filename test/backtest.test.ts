import { backtest } from "../src/methods/";
import { backfill } from "../src/utils";
import { mockExchange } from "./utils";

describe("Backtest", () => {
	test("Works as expected", async () => {
		//  1/1/2020 12:00 AM (GMT)
		const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

		//  1/2/2020 12:00 AM (GMT)
		const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

		const initialBalance = {
			ETH: 0,
			BTC: 100,
		};

		const options = {
			price: 1,
		};

		const simulatedExchange = await mockExchange(
			"binance",
			initialBalance,
			options
		);

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
					await exchange.createOrder("ETH/BTC", "market", "buy", 1);
				} catch (err) {
					throw err;
				}
			}
		);

		expect(result.openOrders.length).toStrictEqual(0);
		expect(result.closedOrders.length).toStrictEqual(23);
		expect(result.errors.length).toStrictEqual(0);

		const totalCost = result.closedOrders.reduce((a, b) => a + b.cost, 0);

		const takerFee = simulatedExchange.exchange.fees["trading"].maker;

		expect(totalCost).toBeCloseTo(
			(options.price + takerFee * options.price) *
				result.closedOrders.length
		);

		expect(result.balance.BTC.free).toBeCloseTo(100 - totalCost);
		expect(result.balance.BTC.used).toStrictEqual(0);
		expect(result.balance.BTC.total).toBeCloseTo(100 - totalCost);
		expect(result.balance.ETH.free).toStrictEqual(23);
		expect(result.balance.ETH.used).toStrictEqual(0);
		expect(result.balance.ETH.total).toStrictEqual(23);
	});
});
