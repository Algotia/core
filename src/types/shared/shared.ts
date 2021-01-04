import { Exchange, OHLCV, SimulatedExchange } from "./exchange";

export type LooseDate = Date | string | number;

export type Strategy = (
	exchange: Exchange | SimulatedExchange,
	data: OHLCV
) => Promise<any> | any;
