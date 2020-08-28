import { backtest, BootData, boot } from "../../../src/algotia";

describe("Backtest", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				exchangeId: "bitstamp",
				timeout: 5000
			}
		});
	});
	afterAll(async () => {
		bootData.quit();
	});
	test("Backtest working", async () => {
		try {
			await backtest(bootData, {
				backfillName: "backfill-1",
				initialBalance: {
					base: 0,
					quote: 100
				},
				strategy: async (exchange, data) => {
					try {
						const balance = await exchange.fetchBalance();
						await exchange.createOrder("ETH/BTC", "market", "buy", 1000);
						const allOrders = await exchange.fetchOrders();
						console.log(allOrders);
					} catch (err) {
						throw err;
					}
				}
			});
		} catch (err) {
			throw err;
		}
	}, 10000);
});
