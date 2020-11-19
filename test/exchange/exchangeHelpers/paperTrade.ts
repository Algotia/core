import { paperTrade } from "../../../src/methods";
import { Exchange, OHLCV, SimulatedExchangeResult } from "../../../src/types";
import sinon from "sinon";

const paperTradeTests = (
	exchanges: SimulatedExchangeResult[],
	initialBalance: Record<string, number>
) => {
	test("Paper trade market order buy", async () => {
		for (const singleExchange of exchanges) {
			const { exchange } = singleExchange;

			const clock = sinon.useFakeTimers();

			const strategy = jest.fn(
				async (exchange: Exchange, data: OHLCV) => {
					await exchange.createOrder("ETH/BTC", "market", "buy", 1);
				}
			);

			const { start, stop } = await paperTrade(
				singleExchange,
				"1m",
				"ETH/BTC",
				strategy
			);

			start();

			setTimeout(() => {
				const res = stop();
				/* expect(res.balance.BTC.free).toBeCloseTo(0.0991); */
				expect(res.openOrders.length).toStrictEqual(0);
			}, 120 * 60 * 1000);

			await clock.tickAsync(120 * 60 * 1000);

			expect(strategy.mock.calls.length).toStrictEqual(120);
		}
	});

	test("Paper trade cancel all orders", async () => {
		for (const singleExchange of exchanges) {
			const clock = sinon.useFakeTimers();

			const strategy = jest.fn(async (exchange: Exchange, data) => {
				const order = await exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);
				await exchange.cancelOrder(order.id);
			});

			const { start, stop } = await paperTrade(
				singleExchange,
				"1m",
				"ETH/BTC",
				strategy
			);

			start();

			setTimeout(() => {
				const res = stop();
				// expect(res.balance.BTC.free).toBeCloseTo(0.0991);
				expect(res.closedOrders.length).toStrictEqual(120);

				for (const closedOrder of res.closedOrders) {
					expect(closedOrder.status).toStrictEqual("canceled");
				}
			}, 120 * 60 * 1000);

			await clock.tickAsync(120 * 60 * 1000);
		}
	});
};


export default paperTradeTests
