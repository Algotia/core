import { boot, backtest } from "../../src/methods";
import {
	AnyAlgotia,
	SingleBackfillOptions,
	SingleBacktestOptions,
} from "../../src/types";
import tulind from "tulind";

describe("Backtest method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: {
				binance: true,
				kucoin: true,
			},
			debug: false,
		});
	});

	afterAll((done) => {
		algotia.quit();
		done();
	});

	test("Multi backtest", async () => {
		try {
			const res = await backtest(algotia, {
				since: "1/10/2020",
				until: "1/11/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "multi",
				exchanges: ["binance", "kucoin"],
				initialBalances: {
					kucoin: {
						ETH: 0,
						BTC: 1,
					},
					binance: {
						ETH: 0,
						BTC: 1,
					},
				},
				strategy: async (exchange, data) => {
					try {
						await exchange.kucoin.createOrder("ETH/BTC", "market", "buy", 1);
						await exchange.binance.createOrder("ETH/BTC", "market", "buy", 1);
						const Kbalance = await exchange.kucoin.fetchBalance();
						const Bbalance = await exchange.binance.fetchBalance();
					} catch (err) {
						throw err;
					}
				},
			});
		} catch (err) {
			throw err;
		}
	}, 100000);
	test("Single backtest", async () => {
		try {
			const options = {
				since: "1/08/2020",
				until: "1/09/2020",
				pair: "ETH/BTC",
				timeframe: "1h",
				type: "single",
				initialBalance: {
					BTC: 0.23,
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
						"limit",
						"buy",
						10,
						0.0001
					);
					/* await exchange.cancelOrder(order.id); */
				},
			};
			const res = await backtest(algotia, options);
			expect(res).toHaveProperty("balance");
			expect(res.balance).toHaveProperty("info");
			expect(res.balance).toHaveProperty("ETH");
			expect(res.balance).toHaveProperty("BTC");
			for (const currency in res.balance) {
				if (currency !== "info") {
					expect(res.balance[currency]).toHaveProperty("free");
					expect(res.balance[currency]).toHaveProperty("total");
					expect(res.balance[currency]).toHaveProperty("used");
				} else {
					const { info, ...restOfBalance } = res.balance;
					expect(info).toStrictEqual(restOfBalance);
				}
			}
			expect(res.openOrders).toHaveProperty("length");
			expect(res.closedOrders).toHaveProperty("length");
			for (const openOrder of res.openOrders) {
				expect(openOrder.trades).toHaveLength(0);
			}

			return res;
		} catch (err) {
			throw err;
		}
	}, 100000);
});
