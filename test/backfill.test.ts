import { backfill, parsePeriod } from "../src/utils"


describe("Backfill", () => {

    const checkCandles = (candles: any[], period: string, expectedLength: number) => {

        const { periodMs } = parsePeriod(period)

        for (let i = 0; i < candles.length; i++) {
            const thisCandle = candles[i];

            expect(thisCandle).toHaveProperty("timestamp")
            expect(thisCandle).toHaveProperty("open")
            expect(thisCandle).toHaveProperty("high")
            expect(thisCandle).toHaveProperty("low")
            expect(thisCandle).toHaveProperty("close")
            expect(thisCandle).toHaveProperty("volume")


            if (i === 0) {
                continue;
            }
            const lastCandle = candles[i - 1]

            expect(lastCandle.timestamp).toStrictEqual(
                thisCandle.timestamp - periodMs
            );
        }

        expect(candles.length).toStrictEqual(expectedLength);
    }

    test("Short backfill", async () => {
        //  1/1/2020 12:00 AM (GMT)
        const fromMs = new Date("1/1/2020 12:00 AM GMT").getTime()

        //  1/2/2020 12:00 AM (GMT)
        const toMs = new Date("1/2/2020 12:00 AM GMT").getTime()

		// 24 hours apart

        const candles = await backfill(fromMs, toMs, "ETH/BTC", "1h", "binance")

		checkCandles(candles, "1h", 24)
    })

    test("Long backfill", async () => {

        const fromMs = new Date("1/1/2020 12:00 PM GMT").getTime()

        const toMs = new Date("1/4/2020 12:00 AM GMT").getTime()

        // 3600 minutes apart

        const candles = await backfill(fromMs, toMs, "ETH/BTC", "1m", "binance")

		checkCandles(candles, "1m", 3600)


    }, 100000)

})
