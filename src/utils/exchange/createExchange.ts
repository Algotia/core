import ccxt from 'ccxt'
import { Exchange, ExchangeID, ExchangeModifications } from '../../types'

const modifications: Record<ExchangeID, ExchangeModifications> = {
    binance: {
        OHLCVRecordLimit: 1000
    },
    kucoin: {
        OHLCVRecordLimit: 1500
    }
}

const createExchange = (id: ExchangeID): Exchange => {

    const exchange = new ccxt[id]();

    return Object.assign(exchange, { ...modifications[id] })

}

export default createExchange
