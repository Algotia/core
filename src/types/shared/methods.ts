import { OHLCV, SimulatedExchangeResult } from "./exchange";
import { Strategy } from "./shared";

export interface BacktestOptions {
	simulatedExchange: SimulatedExchangeResult;
	data: OHLCV[];
	strategy: Strategy;
}

export interface PaperTradeOptions {
	simulatedExchange: SimulatedExchangeResult;
	period: string;
	pair: string;
	pollingPeriod?: string;
	strategy: Strategy;
}
