import { simulateExchange } from "../../src/utils"

describe("Control methods work properly", () => {

	test("fillOrders works", async () => {
		try {

			const {
				exchange,
				store,
				updateContext,
				fillOrders
			} = await simulateExchange("binance", { ETH: 0, BTC: 160 })

			const candle = {
				timestamp: 100,
				open: 1,
				high: 1,
				low: 1,
				close: 75,
				volume: 1
			}

			updateContext(candle.timestamp, candle.close,);

			await exchange.createOrder("ETH/BTC", "market", "buy", 2);
			//TODO: add test that limit order only gets filled when limit price hits

			expect(store.openOrders.length).toStrictEqual(1);
			expect(store.closedOrders.length).toStrictEqual(0)

			expect(store.openOrders[0].status).toStrictEqual("open")
			expect(store.openOrders[0].filled).toStrictEqual(0)
			expect(store.openOrders[0].average).toStrictEqual(null)

			fillOrders(candle)

			expect(store.closedOrders.length).toStrictEqual(1);
			expect(store.openOrders.length).toStrictEqual(0)

			expect(store.closedOrders[0].status).toStrictEqual("closed")
			expect(store.closedOrders[0].filled).toStrictEqual(2)
			expect(store.closedOrders[0].average).toStrictEqual(candle.close)

		} catch(err) {
			throw err
		}
	});

	test("updateContext works", async () => {

		const {
			store,
			updateContext,
		} = await simulateExchange("binance", { ETH: 0, BTC: 2 })

		expect(store.currentTime).toStrictEqual(0)
		expect(store.currentPrice).toStrictEqual(0)

		updateContext(1, 1);

		expect(store.currentTime).toStrictEqual(1)
		expect(store.currentPrice).toStrictEqual(1)

	})

	test("flushStore works", async () => {

		const {
			exchange,
			store,
			updateContext,
			flushStore
		} = await simulateExchange("binance", { ETH: 0, BTC: 2 })

		updateContext(1, 1,);

		await exchange.createOrder("ETH/BTC", "market", "buy", 1);

		expect(store.currentPrice).toStrictEqual(1)
		expect(store.currentPrice).toStrictEqual(1)
		expect(store.openOrders.length).toStrictEqual(1);

		flushStore()

		expect(store.currentPrice).toStrictEqual(0)
		expect(store.currentTime).toStrictEqual(0)
		expect(store.openOrders.length).toStrictEqual(0);

	})

})
