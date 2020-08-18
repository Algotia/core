import { Exchange } from "ccxt";
import { MongoClient, MongoClientOptions } from "mongodb";
import { EventEmitter } from "events";

export interface ExchangeConfigOptions {
	exchangeId: string;
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
export interface BootOptions {
	verbose?: boolean;
}

export interface BootData {
	config: ConfigOptions;
	exchange: Exchange;
	client: MongoClient;
	eventBus: EventEmitter;
}
