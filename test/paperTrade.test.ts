import { paperTrade } from "../src/methods";
import { parsePeriod } from "../src/utils";
import { mockExchange } from "./utils";
import sinon from "sinon";

describe("Paper trade", () => {
	test("paper", async () => {
		const clock = sinon.useFakeTimers();

		const exchange = mockExchange(
			"binance",
			{ BTC: 1, ETH: 0 },
			{ price: 0.1 }
		);

		const strategy = jest.fn(async (exchange, data) => {
			await exchange.createOrder("ETH/BTC", "market", "buy", 1);
			const bal = await exchange.fetchBalance();
		});

		const e = await paperTrade(exchange, "1m", "ETH/BTC", strategy, {
			pollingPeriod: "5s",
		});

		const { periodMs } = parsePeriod("1m");

		// console.log(
		//	"Next timestamp --> ",
		//	new Date().toLocaleString(),
		//	roundTime(new Date(), periodMs, "ceil").toLocaleString()
		// );

		e.start();

		setTimeout(() => {
			const res = e.stop();
			expect(res.balance.BTC.free).toBeCloseTo(0.0991);
		}, 120 * 60 * 1000);

		await clock.tickAsync(120 * 60 * 1000);

		expect(strategy.mock.calls.length).toStrictEqual(120)
	});
});
