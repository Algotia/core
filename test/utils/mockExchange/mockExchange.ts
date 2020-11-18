import {
	ExchangeID,
	SimulatedExchange,
	SimulatedExchangeResult,
} from "../../../src/types";
import { simulateExchange } from "../../../src/exchange";
import { createFetchOHLCV } from "./methods";


const mockExchange = async (
	id: ExchangeID,
	initialBalance: Record<string, number>,
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
		fetchOHLCV: createFetchOHLCV(),
	};

	return {
		exchange,
		...storeAndHelpers,
	};
};

export default mockExchange;
