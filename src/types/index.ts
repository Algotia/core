import { Exchange } from "ccxt";
import { Db, MongoClient } from "mongodb";

export interface IConfigOptions {
	exchange: {
		/**
		 * The name of the exchange you'd like to use. For now, must match an ID from https://github.com/ccxt/ccxt
		 */
		exchangeId: string;
		/**
		 * API key from exchange.
		 */
		apiKey?: string;
		/**
		 * API secret from exchange.
		 */
		apiSecret?: string;
		/**
		 * Timeout, as documented by ccxt.
		 */
		timeout?: number;
	};
}

export type ConfigOptions = IConfigOptions;

export interface IListAllOptions {
	pretty?: boolean;
}

export interface IListOneOptions extends IListAllOptions {
	documentName: string;
}

export type ListAllOptions = IListAllOptions;
export type ListOneOptions = IListOneOptions;

export interface IDeleteAllOptions {
	verbose?: boolean;
}

export interface IDeleteOneOptions extends IDeleteAllOptions {
	documentName: string;
}

export type DeleteOneOptions = IDeleteOneOptions;
export type DeleteAllOptions = IDeleteAllOptions;

export interface BackfillOptions {
	since: string;
	until?: string;
	pair: string;
	period?: string;
	recordLimit?: number;
	documentName?: string;
	verbose?: boolean;
}
export interface IBackfillResults {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	records: OHLCV[];
}

export type BackfillResults = IBackfillResults;

export interface BootOptions {
	verbose?: boolean;
}

export interface IBootData {
	config: ConfigOptions;
	exchange: Exchange;
	client: MongoClient;
	db: Db;
}

export type BootData = IBootData;

// numbers are stored as strings in mongo.
export interface IOHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export type OHLCV = IOHLCV;

export interface IBackfillDocument {
	name: string;
	period: string;
	pair: string;
	since: string;
	until: string;
	records: OHLCV[];
}

export type BackfillDocument = IBackfillDocument;

export interface IBacktestOptions {
	dataSet: string;
	strategy: Function;
}

export type BacktestOtions = IBacktestOptions;
