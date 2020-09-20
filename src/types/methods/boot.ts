import { MongoClient, MongoClientOptions } from "mongodb";
import { Tedis } from "tedis";
import { EventEmitter2 } from "eventemitter2";
import { AllowedExchangeId, SingleExchange } from "../../types";
import { Exchange } from "ccxt";

export interface MongoConfig extends MongoClientOptions {
	port?: number;
}

interface ExchangeCreds {
	apiKey?: string;
	secret?: string;
	timeout?: number;
	[key: string]: number | string | boolean;
}

export type ExchangeConfig = {
	[key in AllowedExchangeId]?: ExchangeCreds | boolean;
};

export type ExchangeObj<T extends ExchangeConfig> = {
	[P in keyof T]: SingleExchange;
};

export type AnyExchangeObj = ExchangeObj<
	{ [K in AllowedExchangeId]?: SingleExchange }
>;

export interface Config {
	exchange: ExchangeConfig;
	mongo?: MongoConfig;
}

export interface BootData {
	config: Config;
	exchange: ExchangeObj<ExchangeConfig>;
	mongoClient: MongoClient;
	redisClient: Tedis;
	eventBus: EventEmitter2;
	quit: () => void;
}
