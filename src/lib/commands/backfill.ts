import { MongoClient } from "mongodb";
import { Exchange } from "ccxt";
import { BackfillOptions, OHLCV } from "../../types/index";
import { log, convertTimeFrame, convertDateToTimestamp, sleep } from "../../utils/index";

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules.

const reshape = (allBackFillsArr: number[][]): OHLCV[] =>
	allBackFillsArr.map((OHLCVarr) => ({
		timestamp: OHLCVarr[0],
		open: OHLCVarr[1],
		high: OHLCVarr[2],
		low: OHLCVarr[3],
		close: OHLCVarr[4],
		volume: OHLCVarr[5]
	}));

export default async (exchange: Exchange, opts: BackfillOptions) => {
	try {
		// set default error function if one was not passed
		const { sinceInput, untilInput, recordLimit, period, pair, documentName, verbose } = opts;
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

			const rawOHLCV = await exchange.fetchOHLCV(pair, period, sinceCursor, recordLimitCursor);
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
		const dbUrl = "mongodb://localhost:27017";
		const dbName = "algotia";
		const dbOptions = {
			useUnifiedTopology: true
		};
		const client = new MongoClient(dbUrl, dbOptions);

		await client.connect();

		const db = client.db(dbName);

		const backfillCollection = db.collection("backfill");
		const docCount = await backfillCollection.countDocuments();

		let docName: string;

		if (documentName) {
			docName = documentName;
		} else {
			docName = `backfill-${docCount + 1}`;
		}

		const toBeInserted = {
			name: docName,
			period: period,
			pair: pair,
			since: since,
			until: until,
			records: allTrades
		};

		await backfillCollection.insertOne(toBeInserted);
		await client.close();

		return toBeInserted;
	} catch (err) {
		Promise.reject(new Error(err));
	}
};
