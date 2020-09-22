import { backtest, BootData, boot } from "../../src/algotia";

describe("Backtest", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				binance: true,
				bitstamp: true
			}
		});
	});
	afterAll(async () => {
		bootData.quit();
	});
	test("Backtest working", async () => {
		try {
			await backtest.create(bootData, {
				backfillName: "backfill-102",
				initialBalance: {
					binance: {
						quote: 100,
						base: 0
					},
					bitstamp: {
						quote: 100,
						base: 0
					}
				},
				type: "multi",
				strategy: async (exchange, data) => {
					console.log(exchange, data);
				}
			});
			//const backtestResults = await backtest(bootData, {
			//backfillName: "backfill-16",
			//initialBalance: {
			//base: 0,
			//quote: 100
			//},
			//strategy: async (exchange, data) => {
			//try {
			//} catch (err) {
			//throw err;
			//}
			//}
			//});
		} catch (err) {
			throw err;
		}
	}, 10000);
});
