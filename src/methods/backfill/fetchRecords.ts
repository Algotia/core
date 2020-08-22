import { log, reshapeOHLCV, sleep } from "../../utils";
import { OHLCV, Exchange } from "../../types";

interface FetchOptions {
	sinceMs: number;
	period: string;
	periodMs: number;
	pair: string;
	recordsToFetch: number;
	recordLimit: number;
	verbose?: boolean;
}

interface RetrieverOptions {
	exchange: Exchange;
	options: FetchOptions;
	onStartMessage?: (recordsLeftToFetch: number) => string;
	onUpdateMessage?: (recordsLeftToFetch: number) => string;
	onDoneMessage?: (recordsFetched: number) => string;
}

interface Records {
	userCandles: OHLCV[];
	internalCandles: OHLCV[];
}

const retrieveCandles = async (
	retrieveOptions: RetrieverOptions
): Promise<OHLCV[]> => {
	const {
		options,
		exchange,
		onStartMessage,
		onUpdateMessage,
		onDoneMessage
	} = retrieveOptions;
	const {
		sinceMs,
		period,
		periodMs,
		pair,
		recordsToFetch,
		recordLimit = exchange.historicalRecordLimit,
		verbose
	} = options;

	let allRecords = [];
	let sinceCursor = sinceMs;
	let recordsLeftToFetch = recordsToFetch;
	let numberOfRecordsToFetch = recordLimit;

	verbose && onStartMessage && log.info(onStartMessage(recordsLeftToFetch));

	while (recordsLeftToFetch) {
		if (recordLimit > recordsLeftToFetch)
			numberOfRecordsToFetch = recordsLeftToFetch;

		const rawOHLCV = await exchange.fetchOHLCV(
			pair,
			period,
			sinceCursor,
			numberOfRecordsToFetch
		);
		const ohlcvArr = reshapeOHLCV(rawOHLCV);

		sinceCursor += ohlcvArr.length * periodMs;

		recordsLeftToFetch -= ohlcvArr.length;
		allRecords.push(...ohlcvArr);

		verbose && onUpdateMessage && log.info(onUpdateMessage(recordsLeftToFetch));

		// wrapper should have rate limit length
		await sleep(1000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
	}

	verbose && onDoneMessage && log.info(onDoneMessage(recordsToFetch));

	return allRecords;
};

const fetchRecords = async (
	exchange: Exchange,
	userOptions: FetchOptions,
	internalOptions: FetchOptions
): Promise<Records> => {
	try {
		//return await retrieveCandles(exchange, fetchOptions);
		const userCandlesPromise = retrieveCandles({
			exchange,
			options: userOptions,
			onStartMessage: (recordsLeftToFetch) => {
				return `Fetching ${recordsLeftToFetch} records`;
			},
			onUpdateMessage: (recordsLeftToFetch) => {
				return `${recordsLeftToFetch} records to fetch`;
			},
			onDoneMessage: (recordsFetched) => {
				return `Fetched ${recordsFetched} records`;
			}
		});
		const internalCandlesPromise = retrieveCandles({
			exchange,
			options: internalOptions,
			onStartMessage: (x) => {
				return "Fetching records for internal use " + x;
			},
			onUpdateMessage: (x) => {
				return x + " left for internal";
			},
			onDoneMessage: () => {
				return "Done fetching records for internal use";
			}
		});

		const [userCandles, internalCandles] = await Promise.all([
			userCandlesPromise,
			internalCandlesPromise
		]);

		return { userCandles, internalCandles };
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
