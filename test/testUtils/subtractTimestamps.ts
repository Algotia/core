import { OHLCV } from "../../src/types";

const subtractTimestamps = (thisCandle: OHLCV, lastCandle: OHLCV): number => {
	return thisCandle.timestamp - lastCandle.timestamp;
};

export default subtractTimestamps;
