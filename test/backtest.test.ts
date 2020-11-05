import backtest from "../src/methods/backtest"
import { backfill } from "../src/utils"

describe("Backtest", () => {

    test("backtest", async () => {

        //  1/1/2020 12:00 AM (GMT)
        const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime()

        //  1/2/2020 12:00 AM (GMT)
        const toMs = new Date("1/2/2020 12:00 AM GMT").getTime()

        const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", "binance")

        await backtest(
            candles,
            "binance",
            {
                "ETH": 10,
                "BTC": 10,
            },
            async (exchange, data) => {
				await exchange.createOrder("ETH/BTC", "market", "buy", 1)
            })
    })
})
