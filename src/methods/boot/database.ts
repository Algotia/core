import { Config } from "../../types/methods/boot";
import { MongoClient } from "mongodb";
import RedisClient, { Redis as IRedisClient } from "ioredis";

const bootDatabases = (
	config: Config
): {
	mongoClient: MongoClient;
	redisClient: IRedisClient;
} => {
	const { mongo, redis } = config;

	const local = "127.0.0.1";
	const defaultMongoPort = 27017;
	const defaultRedisPort = 6379;

	const mongoDbPrefix = "mongodb://";
	const defaultMongoUri = `${mongoDbPrefix}${local}:${defaultMongoPort}`;

	const defaultMongoOptions = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	};

	/* const { */
	/* 	port: mongoPort = defaultMongoPort, */
	/* 	uri: mongoUri = `mongodb://${local}:${defaultMongoPort}`, */
	/* 	...mongoOptions */
	/* } = mongo; */
	/* const { */
	/* 	port: redisPort = defaultRedisPort, */
	/* 	uri: redisUri = local, */
	/* 	...redisOptions */
	/* } = redis; */
	if (!mongo && !redis) {
		return {
			mongoClient: new MongoClient(defaultMongoUri, defaultMongoOptions),
			redisClient: new RedisClient(),
		};
	} else {
		let redisClient: IRedisClient;
		let mongoClient: MongoClient;
		if (mongo) {
			const { port = defaultMongoPort, uri = local, ...options } = mongo;
			const mongoUri = `${mongoDbPrefix}${uri}:${port}`;
			console.log("OPTS", options);
			mongoClient = new MongoClient(mongoUri, {
				...options,
				...defaultMongoOptions,
			});
		}
		if (redis) {
			const { port = defaultRedisPort, uri = local, ...options } = redis;
			redisClient = new RedisClient(port, uri, options);
		}
		return {
			redisClient,
			mongoClient,
		};
	}
};

export default bootDatabases;
