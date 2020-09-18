import { MongoClient, MongoClientOptions } from "mongodb";
import { default as ccxtOriginal, Exchange as CcxtExchange } from "ccxt";
import { Tedis } from "tedis";
import { EventEmitter2 } from "eventemitter2";

export const AllowedExchanges = ["binance", "bitstamp"] as const;
export type AllowedExchangeId = typeof AllowedExchanges[number];

export interface Binance extends ccxtOriginal.binance {
	historicalRecordLimit: number;
}

export interface Bitstamp extends ccxtOriginal.bitstamp {
	historicalRecordLimit: number;
}

export type SingleExchange = CcxtExchange;

export type MultipleExchanges = {
	[key in AllowedExchangeId]: SingleExchange;
};

export interface MongoConfig extends MongoClientOptions {
	port?: number;
}
export type ExchangeConfig = {
	[key in AllowedExchangeId]?: {
		apiKey?: string;
		apiSecret?: string;
		timeout?: number;
	};
};

export type ExchangeObj = {
	[key in AllowedExchangeId]?: CcxtExchange;
};

export interface Config {
	exchange: ExchangeConfig;
	mongo?: MongoConfig;
}

export interface BootData {
	config: Config;
	exchange: ExchangeObj;
	mongoClient: MongoClient;
	redisClient: Tedis;
	eventBus: EventEmitter2;
	quit: () => void;
}
