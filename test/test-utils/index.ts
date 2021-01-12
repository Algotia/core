import { simulateExchange } from "../../src/algotia";

export const initialBalance = {
	BTC: 100,
	ETH: 100,
} as const;

export const simulatedExchange = simulateExchange({ initialBalance });

export const reset = () => simulatedExchange.flushStore();
