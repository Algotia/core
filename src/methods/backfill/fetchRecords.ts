import { log, reshapeOHLCV, sleep } from "../../utils";
import { OHLCV, AnyExchange } from "../../types";

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
	exchange: AnyExchange;
	options: FetchOptions;
	onStartMessage?: (recordsLeftToFetch: number) => string;
	onUpdateMessage?: (recordsLeftToFetch: number) => string;
	onDoneMessage?: (recordsFetched: number) => string;
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
	exchange: AnyExchange,
	userOptions: FetchOptions
): Promise<OHLCV[]> => {
	try {
		//return await retrieveCandles(exchange, fetchOptions);
		const candles = await retrieveCandles({
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
		return candles;
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
