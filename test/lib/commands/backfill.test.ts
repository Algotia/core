import ccxt from "ccxt";
import backfill from "../../../src/lib/commands/backfill";
import { convertDateToTimestamp } from "../../../src/utils/index";
import { BackfillOptions } from "../../../src/types/index";

test("Backfill method", async () => {
	try {
		const _24hrBackfillOptions: BackfillOptions = {
			sinceInput: "12/05/2019 12:00 PST",
			untilInput: "12/06/2019 12:00 PST",
			pair: "BTC/USD",
			period: "1h",
			recordLimit: 30
		};

		const BitfinexTestExchange = new ccxt.bitfinex({
			apiKey: "Te",
			secret: "lol",
			timeout: 5000
		});

		const _24hrBackfillResults = await backfill(BitfinexTestExchange, _24hrBackfillOptions);

		expect(_24hrBackfillResults.records.length).toStrictEqual(24);
		expect(_24hrBackfillResults.period).toStrictEqual(_24hrBackfillOptions.period);
		expect(_24hrBackfillResults.pair).toStrictEqual(_24hrBackfillOptions.pair);
		expect(_24hrBackfillResults.since).toStrictEqual(
			convertDateToTimestamp(_24hrBackfillOptions.sinceInput)
		);
		expect(_24hrBackfillResults.until).toStrictEqual(
			convertDateToTimestamp(_24hrBackfillOptions.untilInput)
		);
	} catch (err) {
		Promise.reject(new Error(err));
	}
}, 10000);
