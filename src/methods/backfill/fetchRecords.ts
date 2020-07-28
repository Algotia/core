import { log, reshapeOHLCV, sleep } from "../../utils";
import { Exchange } from "ccxt";
import { OHLCV } from "../../types";

interface FetchOptions {
	sinceMs: number;
	period: string;
	periodMs: number;
	pair: string;
	recordsToFetch: number;
	recordLimit: number;
	verbose?: boolean;
}

const fetchRecords = async (
	exchange: Exchange,
	fetchOptions: FetchOptions
): Promise<OHLCV[]> => {
	try {
		const {
			sinceMs,
			period,
			periodMs,
			pair,
			recordsToFetch,
			recordLimit,
			verbose
		} = fetchOptions;

		let allRecords = [];
		let sinceCursor = sinceMs;
		let recordsLeftToFetch = recordsToFetch;
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
			const ohlcvArr = reshapeOHLCV(rawOHLCV);

			sinceCursor += ohlcvArr.length * periodMs;

			recordsLeftToFetch -= ohlcvArr.length;
			allRecords = [...allRecords, ...ohlcvArr];

			if (verbose) {
				let message = `${recordsLeftToFetch} records left to fetch.`;
				recordsLeftToFetch !== 0 ? log.info(message) : log.success;
			}
			// wrapper should have rate limit length
			await sleep(1000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
		}
		return allRecords;
	} catch (err) {
		log.error(err);
	}
};

export default fetchRecords;
