"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reshapeOHLCV = (ohlcvArr) => ohlcvArr.map((OHLCV) => ({
    timestamp: OHLCV[0],
    open: OHLCV[1],
    high: OHLCV[2],
    low: OHLCV[3],
    close: OHLCV[4],
    volume: OHLCV[5]
}));
exports.default = reshapeOHLCV;
