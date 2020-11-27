import methodsTests from "./methods";
import exchangeTests from "./exchange";
import utilsTests from "./utils";
import { simulateExchange } from "../src/exchange";


export default async () => {
	const initialBalance = {
		ETH: 100,
		BTC: 100,
	} as const;

	const simulatedExchange = await simulateExchange({ initialBalance });

	await methodsTests(simulatedExchange, initialBalance);
	await exchangeTests(simulatedExchange, initialBalance);
	utilsTests();
};
