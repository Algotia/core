import { backtest } from "../../../src/methods/";
import { backfill } from "../../../src/exchange";
import { SimulatedExchangeResult } from "../../../src/types";

const backtestTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	test("Works as expected", async () => {
		for (const singleExchange of exchanges) {
			const { exchange } = singleExchange;
			//  1/1/2020 12:00 AM (GMT)
			const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime();

			//  1/2/2020 12:00 AM (GMT)
			const toMs = new Date("1/2/2020 12:00 AM GMT").getTime();

			const candles = await backfill(
				fromMs,
				toMs,
				"ETH/BTC",
				"1h",
				exchange
			);

			const result = await backtest(
				singleExchange,
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

			expect(result.openOrders.length).toStrictEqual(0);
			expect(result.closedOrders.length).toStrictEqual(23);
			expect(result.errors.length).toStrictEqual(0);

			const totalCost = result.closedOrders.reduce(
				(a, b) => a + b.cost,
				0
			);

			const totalAmount = result.closedOrders.reduce(
				(a, b) => a + b.amount,
				0
			);

			const takerFee = exchange.fees["trading"].maker;

			/* expect(totalCost).toBeCloseTo( */
			/* 	(options.price + takerFee * options.price) * */
			/* 		result.closedOrders.length */
			/* ); */

			expect(result.balance.BTC.free).toBeCloseTo(
				initialBalance.BTC - totalCost
			);
			expect(result.balance.BTC.used).toStrictEqual(0);
			expect(result.balance.BTC.total).toBeCloseTo(
				initialBalance.BTC - totalCost
			);

			expect(result.balance.ETH.free).toStrictEqual(
				initialBalance.ETH + totalAmount
			);
			expect(result.balance.ETH.used).toStrictEqual(0);
			expect(result.balance.ETH.total).toStrictEqual(
				initialBalance.ETH + totalAmount
			);
		}
	});
};

export default backtestTests;
