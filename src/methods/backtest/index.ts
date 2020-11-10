import {
	OHLCV,
	SimulatedExchangeResult,
	SimulatedExchangeStore,
	Strategy,
} from "../../types";

const backtest = async (
	simulatedExchange: SimulatedExchangeResult,
	data: OHLCV[],
	strategy: Strategy
): Promise<SimulatedExchangeStore> => {

	const { fillOrders, updateContext, store, exchange } = simulatedExchange;

	for (let i = 0; i < data.length; i++) {
		const candle = data[i];

		if (i === data.length - 1) {
			fillOrders(store, candle);
			break;
		}

		const aheadCandle = data[i + 1];

		updateContext(aheadCandle.timestamp, aheadCandle.open);

		try {
			await strategy(exchange, candle);
		} catch (err) {
			store.errors.push(err.message);
		}

		await fillOrders(store, aheadCandle);
	}

	return store;
};

export default backtest;
