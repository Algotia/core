import { OHLCV } from "ccxt";
import { SimulatedExchangeStore } from "../../../types";

const fillOrders = async (store: SimulatedExchangeStore, data: OHLCV) => {
    try {

        for (const order of store.openOrders) {

        }


    } catch (err) {
        throw err
    }
}
