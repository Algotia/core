import { Exchange, OHLCV } from "./exchange"

export type LooseDate = Date | string | number;

export type Strategy = (exchange: Exchange, data: OHLCV) => Promise<any> | any;

