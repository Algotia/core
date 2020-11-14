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

const mockExchange = async (
	id: ExchangeID,
	initialBalance: Record<string, number>,
	options?: MockOptions
): Promise<SimulatedExchangeResult> => {
	const {
		exchange: simulatedExchange,
		...storeAndHelpers
	} = await simulateExchange(id, initialBalance);

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
