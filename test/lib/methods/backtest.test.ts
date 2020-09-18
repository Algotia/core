import { backtest, BootData, boot } from "../../../src/algotia";

describe("Backtest", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				binance: {
					timeout: 5000
				}
			}
		});
	});
	afterAll(async () => {
		bootData.quit();
	});
	test("Backtest working", async () => {
		try {
			//expect(1).toStrictEqual(1);
			const backtestResults = await backtest(bootData, {
				backfillName: "backfill-16",
				initialBalance: {
					base: 0,
					quote: 100
				},
				strategy: async (exchange, data) => {
					try {
						console.log(exchange);
					} catch (err) {
						throw err;
					}
				}
			});
			console.log(backtestResults);
		} catch (err) {
			throw err;
		}
	}, 10000);
});
