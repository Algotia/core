import { simulateExchange } from "../src/algotia";

export const initialBalance = {
	BTC: 100,
	ETH: 100,
} as const;

export const simulatedExchange = simulateExchange({ initialBalance });

export const reset = () => simulatedExchange.flushStore();

export const isCloseTo = (num1: number, num2: number, tolerance = 0.0005) => {
	return Math.abs(num1 - num2) < tolerance;
};
