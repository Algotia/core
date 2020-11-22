import { AllowedExchangeIDs } from "../src/types";
import { mockExchange, test } from "./testUtils/";
import testManger from "./testUtils/testManager";
import methodsTests from "./methods";
import exchangeTests from "./exchange";
import utilsTests from "./utils";

(async function () {
	const initalBalance = {
		ETH: 100,
		BTC: 100,
	} as const;

	try {
		for (const exchangeId of AllowedExchangeIDs) {
			const exchange = await mockExchange(exchangeId, initalBalance);

			test.before = () => {
				exchange.flushStore();
			};
			// Run tests
			await methodsTests(exchange, initalBalance);
			await exchangeTests(exchange, initalBalance);
		}
		await utilsTests()
	} finally {
		testManger.get();
	}
})();
