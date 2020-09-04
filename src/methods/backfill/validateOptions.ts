import { ConvertedBackfillOptions, AnyExchange, InputError } from "../../types";
import chalk from "chalk";

const compareSinceAndUntil = (sinceMs: number, untilMs: number) => {
	if (sinceMs >= untilMs) {
		let greaterOrEqual: string;
		if (sinceMs === untilMs) greaterOrEqual = "equal to";
		if (sinceMs > untilMs) greaterOrEqual = "greater than";
		throw new InputError(
			`Parameter ${chalk.bold.underline(
				"since"
			)} cannot be ${greaterOrEqual} parameter ${chalk.bold.underline("until")}`
		);
	}
};

const checkPeriod = (exchange: AnyExchange, period: string) => {
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

const checkPair = async (exchange: AnyExchange, pair: string) => {
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

const checkRecordLimit = (exchange: AnyExchange, recordLimit: number) => {
	if (recordLimit > exchange.historicalRecordLimit) {
		throw new InputError(`Record limit ${chalk.bold.underline(
			recordLimit
		)} must be less than the
			internal limit for ${exchange.name}: ${exchange.historicalRecordLimit}`);
	}
};

const validateOptions = async (
	exchange: AnyExchange,
	backfillOptions: ConvertedBackfillOptions
) => {
	const { sinceMs, untilMs, period, pair, recordLimit } = backfillOptions;

	compareSinceAndUntil(sinceMs, untilMs);
	checkPeriod(exchange, period);
	checkRecordLimit(exchange, recordLimit);
	await checkPair(exchange, pair);
};

export default validateOptions;
