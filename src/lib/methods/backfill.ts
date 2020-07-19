import {
	BackfillOptions,
	OHLCV,
	BackfillResults,
	BootData
} from "../../types/index";
import {
	log,
	bail,
	convertPeriodToMs,
	convertDateInputToMs,
	sleep
} from "../../utils/index";
import { Exchange } from "ccxt";

// Reshapes OHLCV array into an object
// [timestamp, open, high, low, close, volume]
const reshape = (allBackFillsArr: number[][]): OHLCV[] =>
	allBackFillsArr.map((OHLCVarr) => ({
		timestamp: OHLCVarr[0],
		open: OHLCVarr[1],
		high: OHLCVarr[2],
		low: OHLCVarr[3],
		close: OHLCVarr[4],
		volume: OHLCVarr[5]
	}));

// Converts input into friendly format
interface ConvertedBackfillOptions {
	sinceMs: number;
	untilMs: number;
	totalRecordsToFetch: number;
	periodMs: number;
}
const convertBackfillOptions = (
	backfillOptions: BackfillOptions
): ConvertedBackfillOptions => {
	const { since, until, period } = backfillOptions;
	const sinceMs = convertDateInputToMs(since);
	const untilMs = convertDateInputToMs(until);

	const periodMs = convertPeriodToMs(period);
	const msBetween = untilMs - sinceMs;
	const totalRecordsToFetch = Math.round(msBetween / periodMs);

	return { sinceMs, untilMs, totalRecordsToFetch, periodMs };
};

// Validates sinceMs, untilMs, and period
// TODO: validate pair and documentName
const validateBackfillOptions = (
	convertedInput: ConvertedBackfillOptions,
	backfillOptions: BackfillOptions,
	exchange: Exchange
): void => {
	const { period } = backfillOptions;
	const { sinceMs, untilMs } = convertedInput;

	if (sinceMs > untilMs)
		throw new Error("Invalid date: parameter since cannot be less than until.");

	const allowedTimeframes = Object.keys(exchange.timeframes);
	if (!allowedTimeframes.includes(period))
		throw new Error("Period does not exist as an exchange timeframe");
};

// Converts and validates input and returns converted and valid options
const processInput = (
	backfillOptions: BackfillOptions,
	exchange: Exchange
): ConvertedBackfillOptions => {
	try {
		const convertedOptions = convertBackfillOptions(backfillOptions);

		validateBackfillOptions(convertedOptions, backfillOptions, exchange);

		return convertedOptions;
	} catch (err) {
		bail(err);
	}
};

const backfill = async (
	bootData: BootData,
	backfillOptions: BackfillOptions
): Promise<BackfillResults> => {
	try {
		const { exchange, db } = bootData;
		const {
			recordLimit,
			pair,
			documentName,
			verbose,
			period
		} = backfillOptions;

		const { sinceMs, untilMs, totalRecordsToFetch, periodMs } = processInput(
			backfillOptions,
			exchange
		);

		verbose && log.info(`Records to fetch ${totalRecordsToFetch}`);

		let allTrades = [];
		let sinceCursor = sinceMs;
		let recordsLeftToFetch = totalRecordsToFetch;
		let numberOfRecordsToFetch = recordLimit;

		while (recordsLeftToFetch) {
			if (recordLimit > recordsLeftToFetch)
				numberOfRecordsToFetch = recordsLeftToFetch;

			const rawOHLCV = await exchange.fetchOHLCV(
				pair,
				period,
				sinceCursor,
				numberOfRecordsToFetch
			);
			const ohlcv = reshape(rawOHLCV);

			sinceCursor = ohlcv[ohlcv.length - 1].timestamp + periodMs;

			recordsLeftToFetch -= ohlcv.length;
			allTrades = [...allTrades, ...ohlcv];

			if (verbose) {
				let message = `${recordsLeftToFetch} records left to fetch.`;
				recordsLeftToFetch !== 0 ? log.info(message) : log.success;
			}
			// we should know what the rate limit of each exchange is.
			await sleep(2000, backfillOptions.verbose); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
			// end while loop
		}

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
			since: sinceMs,
			until: untilMs,
			records: allTrades
		};

		await backfillCollection.insertOne(toBeInserted);

		verbose &&
			log.success(
				`Wrote document with name ${docName} to collection ${backfillCollection.collectionName}`
			);

		return toBeInserted;
	} catch (err) {
		log.error(err);
	} finally {
		await bootData.client.close();
	}
};

export default backfill;
