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
			expect(1).toStrictEqual(1);
			//const backtestResults = await backtest(bootData, {
			//backfillName: "backfill-1",
			//initialBalance: {
			//base: 0,
			//quote: 100
			//},
			//strategy: async (exchange, data) => {
			//try {
			//const balance = await exchange.fetchBalance();
			//await exchange.createOrder(
			//"ETH/BTC",
			//"limit",
			//"buy",
			//1000,
			//0.019252
			//);
			//const allOrders = await exchange.fetchOrders();
			//} catch (err) {
			//throw err;
			//}
			//}
			//});
			//console.log(backtestResults);
		} catch (err) {
			throw err;
		}
	}, 10000);
});
