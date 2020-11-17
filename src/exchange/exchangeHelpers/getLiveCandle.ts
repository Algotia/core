import { Exchange, OHLCV } from "../../types";
import { parsePeriod, reshapeOHLCV, roundTime } from "../../utils";

const getLiveCandle = async (
	period: string,
	pair: string,
	currentTimeMs: number,
	exchange: Exchange
): Promise<OHLCV> => {
	try {
		const { periodMs } = parsePeriod(period);

		const lastCandleTimestampApprox = new Date(currentTimeMs - periodMs);
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
	} catch (err) {
		throw err;
	}
};

export default getLiveCandle;
