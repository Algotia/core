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

export interface ListBackfillOptions {
	documentName?: string;
	pretty?: boolean;
}

export interface DeleteBackfillOptions {
	documentName?: string;
}

export interface BackfillOptions {
	since: string;
	until?: string;
	pair: string;
	period?: string;
	recordLimit?: number;
	documentName?: string;
	verbose?: boolean;
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

// numbers are stored as strings in mongo.
export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface BackfillDocument {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	records: OHLCV[];
}

export interface BacktestOptions {
	dataSet: string;
	strategy: Function;
}

export interface ConvertedBackfillOptions extends BackfillOptions {
	sinceMs: number;
	untilMs: number;
	period: string;
	periodMs: number;
	pair: string;
	recordsToFetch: number;
	recordLimit: number;
	verbose?: boolean;
}
