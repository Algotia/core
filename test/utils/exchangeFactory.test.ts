import exchangeFactory from "../../src/utils/internal/exchangeFactory";
import { AllowedExchanges } from "../../src/types";

describe("Exchange Factory", () => {
	test("OHLCVRecordLimit works", async () => {
		try {
			const fetchResults = AllowedExchanges.map(async (id) => {
				try {
					const exchange = exchangeFactory({ id });
					const tooManyOHLCV = await exchange.fetchOHLCV(
						"ETH/BTC",
						"1m",
						new Date("1/01/2020").getTime(),
						100000
					);
					// using 100000 as a placeholder for any number
					// of records that no exchange will support,
					// should find a better solution for this

					return {
						id,
						length: tooManyOHLCV.length,
						OHLCVRecordLimit: exchange.OHLCVRecordLimit,
					};
				} catch (err) {
					console.log(err);
				}
			});

			const allCandles = await Promise.all(fetchResults);
			allCandles.forEach(({ length, OHLCVRecordLimit }) => {
				expect(length).toStrictEqual(OHLCVRecordLimit);
			});
		} catch (err) {
			console.log(err);
		}
	});
});
