import { Exchange, ProcessedBackfillOptions } from "../../../types";
import { parseTimeframe, reshapeOHLCV } from "../../../utils";

const fetchRecords = async (
	exchange: Exchange,
	options: ProcessedBackfillOptions
) => {
	try {
		const { OHLCVRecordLimit } = exchange;
		const { since, until, timeframe, symbol } = options;
		const { unit, amount } = parseTimeframe(timeframe);
		const periodMS = unit * amount;
		const recordsToFetch = Math.floor((until - since) / periodMS);
		if (recordsToFetch < OHLCVRecordLimit) {
			const rawOHLCV = await exchange.fetchOHLCV(
				symbol,
				timeframe,
				since,
				recordsToFetch
			);
			const formattedOHLCV = reshapeOHLCV(rawOHLCV);
			return formattedOHLCV;
		}
	} catch (err) {
		throw err;
	}
};

export default fetchRecords;
