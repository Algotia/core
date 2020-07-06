import { BackfillOptions } from "../../types/index";
import { log, convertTimeFrame, convertDateToTimestamp, sleep } from "../../utils/index";

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules.

interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

const reshape = (arr: OHLCV[]) =>
	arr.map((ohlcv: OHLCV) => ({
		timestamp: ohlcv[0],
		open: ohlcv[1],
		high: ohlcv[2],
		low: ohlcv[3],
		close: ohlcv[4],
		volume: ohlcv[5]
	}));

export default async (exchange, opts: BackfillOptions) => {
	try {
		// set default error function if one was not passed
		if (!opts.errFn) opts.errFn = log.error;

		const { sinceInput, untilInput, recordLimit, period, pair, verbose } = opts;
		const since = convertDateToTimestamp(sinceInput);
		const until = convertDateToTimestamp(untilInput);

		let sinceCursor = since;
		let recordLimitCursor = recordLimit;

		if (sinceCursor > until)
			throw new Error("Invalid date: parameter since cannot be less than until.");

		const allowedTimeframes = Object.keys(exchange.timeframes);
		if (!allowedTimeframes.includes(period))
			throw new Error("Period does not exist as an exchange timeframe");

		const unitsMs = {
			minute: 60000,
			hour: 3600000,
			day: 86400000
		};

		const timeBetween = until - since;
		const { unit, amount } = convertTimeFrame(period);
		const periodMs = unitsMs[unit] * amount;

		let recrodsToFetch = Math.round(timeBetween / periodMs);

		verbose && log.info(`Records to fetch ${recrodsToFetch}`);

		let allTrades = [];

		await sleep(1000, opts.verbose);

		while (recrodsToFetch) {
			if (recordLimit > recrodsToFetch) recordLimitCursor = recrodsToFetch;

			const rawOHLCV = await exchange.fetchOHLCV(pair, period, since, recordLimitCursor);
			const ohlcv = reshape(rawOHLCV);

			sinceCursor = ohlcv[ohlcv.length - 1].timestamp + periodMs;

			recrodsToFetch -= ohlcv.length;
			allTrades = [...allTrades, ...ohlcv];

			if (verbose) {
				recrodsToFetch !== 0
					? log.info(`${recrodsToFetch} records left to fetch.`)
					: log.success(`0 records left to fetch.`);
			}
			// we should know what the rate limit of each exchange is.
			await sleep(2000, opts.verbose); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
			// end while loop
		}

		const toBeInserted = {
			period: period,
			pair: pair,
			since: since,
			until: until,
			records: allTrades
		};
		return toBeInserted;
	} catch (err) {
		Promise.reject(new Error(err));
	}
};
