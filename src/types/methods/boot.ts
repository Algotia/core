import { MongoClient, MongoClientOptions } from "mongodb";
import { default as ccxtOriginal, Exchange as CcxtExchange } from "ccxt";
import { EventEmitter } from "events";

export type BinanceId = "binance";
export type BitstampId = "bitstamp";

export type Binance = typeof ccxtOriginal.binance.prototype;
export type Bitstamp = typeof ccxtOriginal.binance.prototype;

export type AnyExchange = Binance | Bitstamp;
export type AllowedExchangeIds = BinanceId | BitstampId;

export enum AllowedExchangeIdsEnum {
	//Bitfinex = "bitfinex",
	//Kraken = "kraken"
	Binance = "binance",
	Bitstamp = "bitstamp"
}

export interface ExchangeConfigOptions {
	exchangeId: AllowedExchangeIds;
	apiKey?: string;
	apiSecret?: string;
	timeout?: number;
}

export interface DbConfigOptions extends MongoClientOptions {
	port?: number;
}

export interface ConfigOptions {
	exchange: ExchangeConfigOptions;
	db?: DbConfigOptions;
}

export interface Exchange extends CcxtExchange {
	historicalRecordLimit: number;
}

export interface BootData {
	config: ConfigOptions;
	exchange: AnyExchange;
	client: MongoClient;
	eventBus: EventEmitter;
}
