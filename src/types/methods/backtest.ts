import { OHLCV } from "../shared";

type SyncStrategy = (data: OHLCV) => void;
type AsyncStrategy = (data: OHLCV) => Promise<void>;

type Strategy = SyncStrategy | AsyncStrategy;

export interface BacktestInput {
	documentName: string;
	strategy: Strategy;
}
