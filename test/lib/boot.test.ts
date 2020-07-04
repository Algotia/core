import { boot } from "../../src/algotia";

import { ConfigInterface } from "../../src/types/index";
import { Exchange } from "ccxt";

const mockBootConfig: ConfigInterface = {
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
		//const bootData = await boot(mockBootConfig);
		//expect(bootData.config).toStrictEqual(mockBootConfig);
		//expect(bootData.exchange).toBeInstanceOf(Exchange);

		await expect(boot(obviouslyFailingBootConfig)).rejects.toThrow();
	} catch (err) {
		fail(err);
	}
}, 10000);
