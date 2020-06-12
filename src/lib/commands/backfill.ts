import dayjs from 'dayjs';
import { convertTimeFrame } from '../../utils/index'

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules. 

const reshape = (arr) => (arr.map((ohlcv) => ({
    timestamp: ohlcv[0],
    open: ohlcv[1],
    high: ohlcv[2],
    low: ohlcv[3],
    close: ohlcv[4],
    volume: ohlcv[5]
  }))
)

const sleep = (ms) => (new Promise(resolve => setTimeout(resolve, ms))); // This is a sync function that WILL block the main thread, might want to do something else instead


export default async (exchange) => {
    try {
         
        // TODO: These should be args passed in either as flags from the CLI
        
        let since = 1591826400000 
        const until = 1591912800000
        const period = '1m'
        const symbolPair = 'BTC/USD'
        let recordLimit = 200 // could be much higher, this value (as all of the above values) are for testing. 

        const allowedTimeframes = Object.keys(exchange.timeframes);
        if (!allowedTimeframes.includes(period)) throw new Error('Period does not exist as an exchange timeframe');
        
        const {unit: periodUnit, ammount: periodAmmount} = convertTimeFrame(period);
        
        let allTrades = [] 

        let sinceParsed = dayjs(since);
        let untilparsed = dayjs(until);
        let recordsBetween = untilparsed.diff(sinceParsed, periodUnit); 
        if (periodAmmount !== 1) recordsBetween = recordsBetween / periodAmmount;

        while (recordsBetween > 0) {

            if (recordsBetween < recordLimit) recordLimit = recordsBetween;
 
            console.log('records left - ', recordsBetween);

            const rawOHLCV = await exchange.fetchOHLCV(symbolPair, period, since, recordLimit);
            const ohlcv = reshape(rawOHLCV);
            
            const diff = (ohlcv[1].timestamp - ohlcv[0].timestamp); 
            since = ohlcv[ohlcv.length - 1].timestamp + diff;
            
            recordsBetween -= ohlcv.length;
            allTrades = allTrades.concat(ohlcv);
            
            // we should know what the rate limit of each exchange is.
            await sleep(2000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).

        }
        console.log(allTrades[0]);        
        console.log(`Fetched ${allTrades.length} trades`);
        console.log(`First trade - ${allTrades[0].timestamp}`)
        console.log(`Last trade - ${allTrades[allTrades.length - 1].timestamp}`)
        
    }
    catch (err) {
        console.log(err)
    }
}
