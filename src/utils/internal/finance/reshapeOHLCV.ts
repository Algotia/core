import { OHLCV } from "../../../types/index";

const reshapeOHLCV = (ohlcvArr: number[][]): OHLCV[] =>
	ohlcvArr.map((OHLCV) => ({
		timestamp: OHLCV[0],
		open: OHLCV[1],
		high: OHLCV[2],
		low: OHLCV[3],
		close: OHLCV[4],
		volume: OHLCV[5]
	}));

export default reshapeOHLCV;
