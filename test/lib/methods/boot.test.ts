import { Exchange } from "ccxt";
import { boot } from "../../../src/algotia";
import { ConfigOptions } from "../../../src/types/index";
import { MongoClient } from "mongodb";

const mockBootConfig: ConfigOptions = {
	exchange: {
		exchangeId: "binance",
		apiKey: "some string",
		apiSecret: "some string",
		timeout: 5000
	}
};

test("Boot function", async () => {
	try {
		const bootData = await boot(mockBootConfig);
		expect(bootData.config).toStrictEqual(mockBootConfig);
		expect(bootData.exchange).toBeInstanceOf(Exchange);
		expect(bootData.mongoClient).toBeInstanceOf(MongoClient);

		await bootData.mongoClient.close();
	} catch (err) {
		throw err;
	}
}, 10000);
