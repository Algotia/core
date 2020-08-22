import { MongoClient, MongoClientOptions } from "mongodb";
import { Exchange as CcxtExchange } from "ccxt";
import { EventEmitter } from "events";

//export type Bitfinex = "bitfinex";
//export type Kraken = "kraken";
//export type Ftx = "ftx";
export type Binance = "binance";
export type Bitstamp = "bitstamp";

export type AllowedExchangeIdString = Binance | Bitstamp;

export enum AllowedExchangeIds {
	//Bitfinex = "bitfinex",
	//Kraken = "kraken"
	Binance = "binance",
	Bitstamp = "bitstamp"
}

export interface ExchangeConfigOptions {
	exchangeId: AllowedExchangeIdString;
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
	exchange: Exchange;
	client: MongoClient;
	eventBus: EventEmitter;
}
