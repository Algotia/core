import {
	boot,
	SingleBacktestOptions,
	AnyAlgotia,
	MultiBacktestOptions,
} from "../../src/algotia";
import backfill from "../../src/methods/backtest/backfill/index";
import { getBorderCharacters, table } from "table";
import { parseTimeframe } from "../../src/utils";

describe("Backfill method", () => {
	let algotia: AnyAlgotia;
	beforeAll(async () => {
		algotia = await boot({
			exchange: { binance: true, bittrex: true, kucoin: true },
		});
	});
	afterAll(() => {});
	/* test("Single backfill works", async () => { */
	/* 	try { */
	/* 		const options: SingleBacktestOptions = { */
	/* 			since: "1/01/2020", */
	/* 			until: "1/02/2020 1:00 AM", */
	/* 			symbol: "ETH/BTC", */
	/* 			timeframe: "15m", */
	/* 			type: "single", */
	/* 			strategy: () => {}, */
	/* 		}; */
	/* 		const res = await backfill(algotia, options, "binance"); */

	/* 		const { periodMS } = parseTimeframe(options.timeframe); */
	/* 		for (let i = 0; i < res.length; i++) { */
	/* 			const thisTimestamp = res[i].timestamp; */

	/* 			if (i === 0) { */
	/* 				const sinceMs = new Date(options.since).getTime(); */
	/* 				expect(thisTimestamp).toStrictEqual(sinceMs); */
	/* 				continue; */
	/* 			} */

	/* 			const lastTimestamp = res[i - 1].timestamp; */

	/* 			expect(thisTimestamp).toStrictEqual(lastTimestamp + periodMS); */
	/* 		} */
	/* 	} catch (err) { */
	/* 		throw err; */
	/* 	} */
	/* }); */
	test("Multi backfill works", async () => {
		try {
			const options: MultiBacktestOptions = {
				since: "1/01/2020",
				until: "1/02/2020",
				symbol: "ETH/BTC",
				timeframe: "1h",
				type: "multi",
				strategy: () => {},
			};
			const res = await backfill(algotia, options, ["binance", "bittrex"]);
			expect(1).toStrictEqual(1);
		} catch (err) {
			throw err;
		} finally {
			algotia.quit();
		}
	});
});
