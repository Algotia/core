import { Exchange } from "ccxt";
import { boot } from "../../../src/algotia";
import {
	Config,
	MultipleExchanges,
	SingleExchange
} from "../../../src/types/index";
import { MongoClient } from "mongodb";
import { inspect } from "util";

const multiConfig = {
	exchange: {
		binance: {
			timeout: 12000
		},
		bitstamp: true
	}
};

const singleConfig = {
	exchange: {
		binance: {
			timeout: 5000
		}
	}
};

test("Boot function", async () => {
	try {
		const multiBootData = await boot(multiConfig);
		//for (const id in multiBootData.exchange) {
		//const exchange = multiBootData.exchange[id];
		//expect(exchange).toBeInstanceOf(Exchange);
		//expect(multiBootData.config).toStrictEqual(multiConfig);
		//}
		console.log(multiBootData.exchange.binance.timeout);
		console.log(multiBootData.exchange.bitstamp.timeout);
		multiBootData.quit();

		//const singleBootData = await boot(singleConfig);
		//expect(singleBootData.exchange.binance).toBeInstanceOf(Exchange);
		//singleBootData.quit();
	} catch (err) {
		throw err;
	} finally {
	}
}, 10000);
