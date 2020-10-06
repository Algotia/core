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

export type ExchangeRecord<T> = Record<keyof Config["exchange"], T>;

export type AlgotiaExchanges = ExchangeRecord<Exchange>;

export interface Algotia<Conf extends Config> {
	config: Conf;
	exchanges: AlgotiaExchanges;
	mongo: Db;
	redis: Redis;
	quit: () => void;
}

export type AnyAlgotia = Algotia<Config>;
