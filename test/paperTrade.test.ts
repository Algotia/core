import { paperTrade } from "../src/methods";

describe("Paper trade", () => {
	test("paper", async (done) => {
		const e = await paperTrade(
			"binance",
			"1m",
			"ETH/BTC",
			{ BTC: 1, ETH: 0 },
			async (exchange, data) => {
				console.log('data --> ', data);
			},
			{
				pollingPeriod: "30s"
			}
		);
		e.emit('start')

		setTimeout(()=>{
			console.log('stopping')
			e.emit('stop')

		}, 120000)

		e.on('result', (res) => {
			console.log("RES --> ", res)
			done()
		})

		expect(1).toStrictEqual(1)

	}, 99999999);
});
