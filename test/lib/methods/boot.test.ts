import { Exchange } from "ccxt";
import { boot } from "../../../src/algotia";
import {
	Config,
	MultipleExchanges,
	SingleExchange,
	ExchangeConfigError,
	BootData
} from "../../../src/types/index";
import { MongoClient } from "mongodb";
import { inspect } from "util";

describe("Boot function", () => {
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

	const multiConfigWithFalse = {
		exchange: {
			binance: true,
			bitstamp: false
		}
	};

	const badConfig = {
		exchange: {
			notAnExchange: true,
			binance: true
		}
	};

	test("Multi exchange boot is valid", async () => {
		let bootData: BootData;
		try {
			bootData = await boot(multiConfig);

			for (const id in bootData.exchange) {
				const exchange = bootData.exchange[id];
				expect(exchange).toBeInstanceOf(Exchange);
				expect(bootData.config).toStrictEqual(multiConfig);
			}
		} finally {
			bootData.quit();
		}
	});

	test("Single exchange boot is valid", async () => {
		let bootData: BootData;
		try {
			bootData = await boot(singleConfig);

			expect(bootData.exchange.binance).toBeInstanceOf(Exchange);
		} finally {
			bootData.quit();
		}
	});

	test("Multiple config with false should return one exchange", async () => {
		let bootData: BootData;
		try {
			bootData = await boot(multiConfigWithFalse);
			const exchangeKeys = Object.keys(bootData.exchange);
			expect(exchangeKeys.length).toStrictEqual(1);
			expect(exchangeKeys[0]).toStrictEqual("binance");
		} finally {
			bootData.quit();
		}
	});

	test("Config with non-allowed exchange ID should fail", async () => {
		try {
			const badBoot = await boot(badConfig);
			expect(badBoot).rejects.toThrow(ExchangeConfigError);
		} catch (err) {
			expect(err.key).toStrictEqual("exchangeId");
			expect(err.value).toStrictEqual("notAnExchange");
		}
	});
});
