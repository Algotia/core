import {
	ExchangeID,
	OHLCV,
	SimulatedExchangeStore,
	Strategy,
} from "../../types";
import { fillOrders, simulateExchange } from "../../utils/";

const backtest = async (
	data: OHLCV[],
	exchangeId: ExchangeID,
	initalBalance: Record<string, number>,
	strategy: Strategy
): Promise<SimulatedExchangeStore> => {
	const { exchange, store } = simulateExchange(exchangeId, initalBalance);

	for (let i = 0; i < data.length; i++) {
		const candle = data[i];

		if (i === data.length - 1) {
			fillOrders(store, candle);
			break;
		}

		const aheadCandle = data[i + 1];

		store.currentTime = aheadCandle.timestamp;
		store.currentPrice = aheadCandle.open;

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
