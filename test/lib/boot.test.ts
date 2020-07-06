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

const bootOptions = {
	noDbCheck: true
};

test("Boot function", async () => {
	try {
		const bootData = await boot(mockBootConfig, bootOptions);
		expect(bootData.config).toStrictEqual(mockBootConfig);
		expect(bootData.exchange).toBeInstanceOf(Exchange);

		await expect(boot(obviouslyFailingBootConfig, bootOptions)).rejects.toThrow();
	} catch (err) {
		fail(err);
	}
}, 10000);
