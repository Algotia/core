import { MongoClient, Db } from "mongodb";
import RedisClient, { Redis } from "ioredis";

const bootDatabases = async (): Promise<{
	mongo: Db;
	mongoClient: MongoClient;
	redis: Redis;
}> => {
	try {
		const mongoClient = new MongoClient(
			process.env.MONGO_URL || `mongodb://localhost:27017`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				serverSelectionTimeoutMS: 10000,
			}
		);

		const redis = new RedisClient();

		const connected = await mongoClient.connect();

		const dbName = "algotia";
		const mongo: Db = connected.db(dbName);

		return {
			mongo,
			mongoClient,
			redis,
		};
	} catch (err) {
		throw err;
	}
};

export default bootDatabases;
