import {
	OHLCV,
	SimulatedExchangeResult,
	SimulatedExchangeStore,
} from "./exchange";
import { Strategy } from "./shared";

export interface BacktestOptions {
	simulatedExchange: SimulatedExchangeResult;
	data: OHLCV[];
	strategy: Strategy;
}
export type BacktestResults = Omit<
	SimulatedExchangeStore,
	"currentTime" | "currentPrice"
>;

export interface PaperTradeOptions {
	simulatedExchange: SimulatedExchangeResult;
	period: string;
	pair: string;
	pollingPeriod?: string;
	strategy: Strategy;
}
