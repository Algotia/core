import {
	AnyAlgotia,
	ExchangeID,
	OHLCV,
	SingleBacktestOptions,
	MultiBacktestOptions,
	BacktestingExchange,
	AsyncFunction,
	ExchangeError,
	SingleBackfillSet,
	MultiBackfillSet,
	ExchangeRecord,
	isSingleBackfillSet,
	isMultiBackfillSet,
	isExchangeRecord,
	isSingleBacktestingOptions,
	isMultiBacktestingOptions,
} from "../../types";
import { setCurrentTime, setCurrentPrice, fillOrder } from "../../utils";

const updateContext = async (
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiBacktestOptions,
	exchangeId: ExchangeID,
	candle: OHLCV
): Promise<void> => {
	try {
		await setCurrentTime(algotia, candle.timestamp);
		await setCurrentPrice(algotia, exchangeId, options.asset, candle.open);
	} catch (err) {
		throw err;
	}
};

async function executeStrategy(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions,
	exchange: BacktestingExchange,
	data: SingleBackfillSet
): Promise<string[]>;

async function executeStrategy<MultiOptions extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: MultiOptions,
	exchange: ExchangeRecord<BacktestingExchange>,
	data: MultiBackfillSet<MultiOptions>
): Promise<ExchangeRecord<string[]>>;

async function executeStrategy<MultiOptions extends MultiBacktestOptions>(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiOptions,
	exchange: BacktestingExchange | ExchangeRecord<BacktestingExchange>,
	data: SingleBackfillSet | MultiBackfillSet<MultiOptions>
): Promise<string[] | ExchangeRecord<string[]>> {
	if (
		isMultiBacktestingOptions(options) &&
		isMultiBackfillSet(data) &&
		isExchangeRecord(exchange)
	) {
		const { strategy } = options;

		let strategyErrors: Record<MultiOptions["exchanges"][number], string[]>;

		const callStrategy = async (userCandle: typeof data[number]) => {
			try {
				if (strategy instanceof AsyncFunction) {
					await strategy(exchange, userCandle);
				} else {
					strategy(exchange, userCandle);
				}
			} catch (err) {
				// Push errors to strategyErrors
				if (err instanceof ExchangeError) {
					const stratArr = strategyErrors[err.exchangeId];
					if (stratArr && stratArr[err.exchangeId]) {
						strategyErrors[err.exchangeId].push(err.message);
					} else {
						strategyErrors = Object.assign({}, strategyErrors, {
							[err.exchangeId]: err.message,
						});
					}
				}
			}
		};

		for (let i = 0; i < data.length; i++) {
			const userCandle = data[i];
			const aheadCandle = data[i + 1];

			if (i === data.length - 1) {
				await callStrategy(userCandle);
				break;
			}

			for (const exchangeId in aheadCandle) {
				// Update time and current price
				await updateContext(
					algotia,
					options,
					exchange[exchangeId].id,
					aheadCandle[exchangeId]
				);
			}
			// Call strategy
			await callStrategy(userCandle);

			// Attempt to fill any open orders
			for (const id in exchange) {
				await fillOrder(algotia, exchange[id], aheadCandle[id]);
			}
		}
	} else if (
		isSingleBacktestingOptions(options) &&
		isSingleBackfillSet(data) &&
		!isExchangeRecord(exchange)
	) {
		const { strategy } = options;

		const callStrategy = async (candle: typeof data[number]) => {
			try {
				if (strategy instanceof AsyncFunction) {
					await strategy(exchange, candle);
				} else {
					strategy(exchange, candle);
				}
			} catch (err) {
				// Push errors to strategyErrors
				if (err instanceof ExchangeError) {
					strategyErrors.push(err.message);
				}
			}
		};

		let strategyErrors: string[] = [];

		for (let i = 0; i < data.length; i++) {
			const userCandle = data[i];
			const aheadCandle = data[i + 1];

			if (i === data.length - 1) {
				await callStrategy(userCandle);
				break;
			}

			// Update time and current price
			await updateContext(algotia, options, exchange.id, aheadCandle);

			// Call strategy
			await callStrategy(userCandle);

			// Attempt to fill any open orders
			await fillOrder(algotia, exchange, aheadCandle);
		}

		return strategyErrors;
	}
}

export default executeStrategy;
