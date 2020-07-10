import { MongoClient } from "mongodb";
import { Exchange } from "ccxt";
import { BackfillOptions, OHLCV } from "../../types/index";
import { log, convertTimeFrame, convertDateToTimestamp, sleep } from "../../utils/index";

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules.

interface BackfillResults {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	records: OHLCV[];
}

const reshape = (allBackFillsArr: number[][]): OHLCV[] =>
	allBackFillsArr.map((OHLCVarr) => ({
		timestamp: OHLCVarr[0],
		open: OHLCVarr[1],
		high: OHLCVarr[2],
		low: OHLCVarr[3],
		close: OHLCVarr[4],
		volume: OHLCVarr[5]
	}));

export default async (exchange: Exchange, opts: BackfillOptions): Promise<BackfillResults> => {
	try {
		const { sinceInput, untilInput, recordLimit, period, pair, documentName, verbose } = opts;
		const since = convertDateToTimestamp(sinceInput);
		const until = convertDateToTimestamp(untilInput);
		let sinceCursor = since;
		let recordLimitCursor = recordLimit;

		// initial error checking

		if (since === 0 || until === 0) {
			throw new Error("Invalid date input");
		}

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

		const recordsBetween = Math.round(timeBetween / periodMs);
		let recrodsToFetch = recordsBetween;

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
					: log.success(`Fetched ${recordsBetween} records.`);
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

		const toBeInserted: BackfillResults = {
			name: docName,
			period: period,
			pair: pair,
			since: since,
			until: until,
			records: allTrades
		};

		await backfillCollection.insertOne(toBeInserted);

		verbose &&
			log.success(
				`Wrote document with name ${docName} to collection ${backfillCollection.collectionName}`
			);

		await client.close();
		return toBeInserted;
	} catch (err) {
		return Promise.reject(err);
	}
};
