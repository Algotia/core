import { ExchangeID, Exchange } from "../shared";
import { Redis, RedisOptions } from "ioredis";
import { MongoClientOptions, MongoClient } from "mongodb";

interface MongoConfig extends MongoClientOptions {
	port?: number;
	uri?: string;
}

interface RedisConfig extends RedisOptions {
	port?: number;
	uri?: string;
}
type ExchangeConfig = {
	[key in ExchangeID]?: ExchangeOptions | boolean;
};

export interface ExchangeOptions {
	apiKey?: string;
	secret?: string;
	timeout?: number;
	[key: string]: any;
}

export interface Config {
	exchange: ExchangeConfig;
	mongo?: MongoConfig;
	redis?: RedisConfig;
}

export type ExchangeRecord<T> = Record<keyof Config["exchange"], T>;

export type AlgotiaExchanges = ExchangeRecord<Exchange>;

export interface Algotia<Conf extends Config> {
	config: Conf;
	exchanges: AlgotiaExchanges;
	mongoClient: MongoClient;
	redisClient: Redis;
}

export type AnyAlgotia = Algotia<Config>;
