import { test } from "./testUtils/";
import testManger from "./testUtils/testManager";
import methodsTests from "./methods";
import exchangeTests from "./exchange";
import utilsTests from "./utils";
import { simulateExchange } from "../src/exchange";

(async function () {
	const initialBalance = {
		ETH: 100,
		BTC: 100,
	} as const;

	try {
		const simulatedExchange = await simulateExchange({ initialBalance });

		test.before = () => {
			simulatedExchange.flushStore();
		};

		// Run tests
		await methodsTests(simulatedExchange, initialBalance);
		await exchangeTests(simulatedExchange, initialBalance);
		await utilsTests();

	} finally {
		testManger.get();
	}
})();
