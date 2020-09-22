import { MongoClient, MongoClientOptions } from "mongodb";
import { Tedis } from "tedis";
import { EventEmitter2 } from "eventemitter2";
import { AllowedExchangeId, SingleExchange } from "../../types";

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

export type LooseExchangeObj = ExchangeObj<{ [K in AllowedExchangeId]?: true }>;

export interface Config {
	exchange: ExchangeConfig;
	mongo?: MongoConfig;
}

export interface BootData<UserConfig extends Config> {
	config: Config;
	exchange: ExchangeObj<UserConfig["exchange"]>;
	mongoClient: MongoClient;
	redisClient: Tedis;
	eventBus: EventEmitter2;
	quit: () => void;
}

export interface LooseBootData {
	config: Config;
	exchange: LooseExchangeObj;
	mongoClient: MongoClient;
	redisClient: Tedis;
	eventBus: EventEmitter2;
	quit: () => void;
}
