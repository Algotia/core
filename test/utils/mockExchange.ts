import { Exchange, ExchangeID, SimulatedExchangeResult } from "../../src/types";
import { simulateExchange } from "../../src/utils";

const mockExchange = (
	id: ExchangeID,
	initialBalance: Record<string, number>
): SimulatedExchangeResult => {
	const {
		exchange: simulatedExchange,
		...storeAndHelpers
	} = simulateExchange(id, initialBalance);

	const exchange = {
		...simulatedExchange,
	}

	return {
		exchange,
		...storeAndHelpers,
	};
};
