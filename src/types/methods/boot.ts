import { ExchangeID, Exchange } from "../shared";
import { Redis } from "ioredis";
import { Db } from "mongodb";

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
	debug?: boolean;
}

export type ExchangeRecord<T> = Partial<Record<keyof Config["exchange"], T>>;

export interface Algotia<Conf extends Config> {
	config: Conf;
	exchanges: ExchangeRecord<Exchange>;
	mongo: Db;
	redis: Redis;
	quit: () => void;
}

export type AnyAlgotia = Algotia<Config>;
