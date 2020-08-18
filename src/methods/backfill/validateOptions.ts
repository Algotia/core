import { ConvertedBackfillOptions } from "../../types";
import chalk from "chalk";
import { Exchange } from "ccxt";

class InputError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Input Error";
	}
}

const compareSinceAndUntil = (sinceMs: number, untilMs: number) => {
	if (sinceMs >= untilMs) {
		let greaterOrEqual: string;
		if (sinceMs === untilMs) greaterOrEqual = "equal to";
		if (sinceMs > untilMs) greaterOrEqual = "greater than";
		throw new InputError(
			`Parameter ${chalk.bold.underline(
				"since"
			)} cannot be ${greaterOrEqual} parameter ${chalk.bold.underline(
				"until"
			)} `
		);
	}
};

const checkPeriod = (exchange: Exchange, period: string) => {
	const allowedPeriods = Object.keys(exchange.timeframes);
	if (!allowedPeriods.includes(period)) {
		throw new InputError(
			`Period ${chalk.bold.underline(
				period
			)} does not exist on exchange ${chalk.bold.underline(exchange.name)} \n
			Allowed periods: ${allowedPeriods}
			`
		);
	}
};

const checkPair = async (exchange: Exchange, pair: string) => {
	await exchange.loadMarkets();
	const allowedPairs = Object.keys(exchange.markets);
	if (!allowedPairs.includes(pair)) {
		throw new InputError(`Pair ${chalk.bold.underline(
			pair
		)} does not exist on exchange
			${chalk.bold.underline(exchange.name)} \n
			Allowed pairs: ${allowedPairs}`);
	}
};

const validateOptions = async (
	exchange: Exchange,
	backfillOptions: ConvertedBackfillOptions
) => {
	const { sinceMs, untilMs, period, pair } = backfillOptions;

	compareSinceAndUntil(sinceMs, untilMs);
	checkPeriod(exchange, period);
	await checkPair(exchange, pair);
};

export default validateOptions;
