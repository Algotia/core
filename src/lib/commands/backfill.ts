import { getRepository } from 'typeorm'
import Candle from '../../entities/candle';
//TODO: Probably should split these utility functions out as they will be useful in a bunch of other modules. 

const batchWriteCandles = async (candles: Object[]) => {
    try {
        console.log(candles[0])
        const repo = getRepository(Candle);
        await repo.save(candles);
        console.log("Wrote to database");

    } catch (err) {
        console.log("Error writing to database: ", err);
    }
}

const readCandles = async () => {
    const repo = getRepository(Candle);
    const [candles, count] = await repo.findAndCount({})
    console.log(candles, count);
}

const removeCandles = async () => {
    const repo = getRepository(Candle);
    await repo.clear();
}

const reshape = (arr) => (arr.map((ohlcv) => ({
    timestamp: ohlcv[0],
    open: ohlcv[1],
    high: ohlcv[2],
    low: ohlcv[3],
    close: ohlcv[4],
    volume: ohlcv[5]
}))
)

const sleep = (ms) => (new Promise(resolve => setTimeout(resolve, ms)));

export default async (exchange) => {
    try {
        // The timestamps used in the following example 

        let allTrades = []
        let since = 1591480800000 // -1 day from now -- change to programmatic 
        const until = 1591567200000

        await removeCandles();

        while (since < until) {
            const recordLimit = 5 // should be var dependent on config -- also each exchange has their own internal limit on how many records can be requested at once.

            const rawOHLCV = await exchange.fetchOHLCV('BTC/USD', '1h', since, recordLimit);
            const ohlcv = reshape(rawOHLCV);

            const diff = (ohlcv[ohlcv.length - 1].timestamp) - (ohlcv[ohlcv.length - 2].timestamp); // maybe use date manipulation lib instead
            since = ohlcv[ohlcv.length - 1].timestamp + diff; // + diff to avoid duplicated for the last time period of each req

            allTrades = allTrades.concat(ohlcv) // maybe write to db in between requests to improve performance for large backfills? 

            await sleep(2000); // must sleep to avoid getting rate limited. prob should change this to be configurable

        }
        await batchWriteCandles(allTrades);
        await readCandles();
    }
    catch (err) {
        console.log(err)
    }
}