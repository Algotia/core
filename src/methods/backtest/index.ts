import {Exchange, ExchangeID, OHLCV} from "../../types"
import { simulateExchange } from "../../utils/"


const backtest = async (
		data: OHLCV[], 
		exchangeId: ExchangeID,
		initalBalance: Record<string, number>,
		strategy: (exchange: Exchange, candle: OHLCV) => void
) => {
    try {
		const { exchange, store } =  simulateExchange(exchangeId, initalBalance)

		let errors = [];
		for (const candle of data) {
			store.currentTime = candle.timestamp;
			store.currentPrice = candle.open;

			try {
				strategy(exchange, candle);
			} catch (err) {
				errors.push(err.message)
			}
		}


    } catch (err) {
        throw err
    }
}

export default backtest
