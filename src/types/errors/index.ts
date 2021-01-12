export interface StrategyError {
	timestamp: number;
	message: string;
}

export const createStrategyError = (args: StrategyError): StrategyError => {
	return args;
};
