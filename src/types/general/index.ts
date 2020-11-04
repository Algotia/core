import {Exchange as CCXTExchange} from "ccxt";

export const AllowedExchangeIDs = ["binance", "kucoin"] as const;

export type ExchangeID =  typeof AllowedExchangeIDs[number]

export interface ExchangeModifications {
		OHLCVRecordLimit: number;
} 

export interface Exchange extends CCXTExchange, ExchangeModifications {}


