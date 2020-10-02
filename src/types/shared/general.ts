import { Exchange, OHLCV } from "./ccxt";
import { ExchangeRecord } from "../methods";

type Timeframes = [
	"1m",
	"3m",
	"5m",
	"15m",
	"30m",
	"1h",
	"2h",
	"4h",
	"6h",
	"8h",
	"12h",
	"1d",
	"3d",
	"1w",
	"1M"
];

export type Timeframe = Timeframes[number];

export type SingleSyncStrategy = (exchange: Exchange, data: OHLCV) => void;
export type SingleAsyncStrategy = (
	exchange: Exchange,
	data: OHLCV
) => Promise<void>;

export type MultiSyncStartegy = (
	exhanges: ExchangeRecord<Exchange>,
	data: ExchangeRecord<OHLCV>
) => void;
export type MultiAsyncStartegy = (
	exhanges: ExchangeRecord<Exchange>,
	data: ExchangeRecord<OHLCV>
) => Promise<void>;
