import {OHLCV} from "../../src/types";
import { parsePeriod } from "../../src/utils";

const generateFakeCandles = (
	from: Date,
	to: Date,
	period: string,
	removeRandom?: boolean
): OHLCV[] => {
	const fromMs = from.getTime();
	const toMs = to.getTime();

	const { periodMs } = parsePeriod(period);

	const recordsBetween = Math.floor((toMs - fromMs) / periodMs);


	let candles: OHLCV[] = []
	let timeCursor = fromMs;

	for (let i = 0; i < recordsBetween; i++) {

		const getRandomFloat = () => Math.random()

		const candle: OHLCV = {
			timestamp: timeCursor,
			open: getRandomFloat(),
			high: getRandomFloat(),
			low: getRandomFloat(),
			close: getRandomFloat(),
			volume: getRandomFloat()
		}

		timeCursor += periodMs;
		
		candles.push(candle)

	}
	return candles


};

export default generateFakeCandles
