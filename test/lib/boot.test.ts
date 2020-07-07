import { Exchange } from "ccxt";

import { boot } from "../../src/algotia";
import { ConfigOptions } from "../../src/types/index";

const mockBootConfig: ConfigOptions = {
	exchange: {
		exchangeId: "bitfinex",
		apiKey: "some string",
		apiSecret: "some string",
		timeout: 5000
	}
};

const obviouslyFailingBootConfig = {
	exchange: {
		exchangeId: 123,
		apiKey: 123,
		apiSecret: 123,
		timeout: "hello"
	}
};

test("Boot function", async () => {
	try {
		// TODO: Write a test that checks the first and last timestamp
		// of the backfill to ensure that the proper records were backfilled
		const bootData = await boot(mockBootConfig);
		expect(bootData.config).toStrictEqual(mockBootConfig);
		expect(bootData.exchange).toBeInstanceOf(Exchange);

		await expect(boot(obviouslyFailingBootConfig)).rejects.toThrow();
	} catch (err) {
		fail(err);
	}
}, 10000);
