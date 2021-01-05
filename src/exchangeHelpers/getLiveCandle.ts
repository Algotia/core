import { Exchange, OHLCV, SimulatedExchange } from "../types";
import { parsePeriod, reshapeOHLCV, roundTime } from "../utils";

/** Get the last full live candle from the exchange.
 */
const getLiveCandle = async (
	period: string,
	pair: string,
	exchange: Exchange | SimulatedExchange
): Promise<OHLCV> => {
	const { periodMs } = parsePeriod(period);

	const lastCandleTimestampApprox = new Date(Date.now() - periodMs);
	const lastCandleTimestamp = roundTime(
		lastCandleTimestampApprox,
		periodMs,
		"floor"
	);

	const rawCandle = await exchange.fetchOHLCV(
		pair,
		period,
		lastCandleTimestamp.getTime(),
		1
	);

	const ohlcv = reshapeOHLCV(rawCandle)[0];

	return ohlcv;
};

export default getLiveCandle;
