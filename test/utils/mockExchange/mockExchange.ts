import {
	ExchangeID,
	SimulatedExchange,
	SimulatedExchangeResult,
} from "../../../src/types";
import { simulateExchange } from "../../../src/utils";
import { createFetchOHLCV } from "./methods";

export interface MockOptions {
	price?: number
}

const mockExchange = (
	id: ExchangeID,
	initialBalance: Record<string, number>,
	options?: MockOptions
): SimulatedExchangeResult => {
	const {
		exchange: simulatedExchange,
		...storeAndHelpers
	} = simulateExchange(id, initialBalance);

	const exchange: SimulatedExchange = {
		...simulatedExchange,
		rateLimit: 0,
		has: {
			...simulatedExchange.has,
			fetchOHLCV: "simulated",
		},
		fetchOHLCV: createFetchOHLCV(options),
	};

	return {
		exchange,
		...storeAndHelpers,
	};
};

export default mockExchange;
