import { MongoClient, MongoClientOptions } from "mongodb";
import { Exchange as CcxtExchange } from "ccxt";
import { EventEmitter } from "events";

export enum AllowedExchangeIds {
	Bitfinex = "bitfinex",
	Binance = "binance"
}

export type AllowedExchangeIdString = "bitfinex" | "binance";

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
