import dayjs from 'dayjs';
import { convertTimeFrame } from '../../utils/index'

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules. 

interface Options {
  since: number,
  pair: string,
  until: number,
  period: string,
  recordLimit: number
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

const sleep = (ms: number) => (new Promise(resolve => setTimeout(resolve, ms))); // This is a sync function that WILL block the main thread, might want to do something else instead

export default async (exchange, opts: Options) => {
    try {
         

        // properties that are not assigned a default value are required
        const {
          pair,                       
          until,
          period,
        } = opts;

        let {
          since,                           
          recordLimit, // TODO: change the default to a dynamic value
        } = opts; // destructure mutable properties seperately (maybe better way to do this?)
        
        const allowedTimeframes = Object.keys(exchange.timeframes);
        if (!allowedTimeframes.includes(period)) throw new Error('Period does not exist as an exchange timeframe');

        const periodUnitMS = {
            minute: 60000,
            hour: 3600000,
            day: 86400000
        };

        const msDiff = until - since;
        const {unit, ammount }= convertTimeFrame(period);

        let recrodsToFetch = (msDiff / (periodUnitMS[unit] * ammount));
        console.log(`Records to fetch ${recrodsToFetch}`);
        
        let allTrades = []

        // TODO: calculate how many periods total to fetch, and if the record
        // limit is greater than the remaining periods to fetch, set the record
        // limit to the remaining number of periods
        await sleep(500)
        while (since < until) {
            
            if (recordLimit > recrodsToFetch) recordLimit = recrodsToFetch;
              
            const rawOHLCV = await exchange.fetchOHLCV(pair, period, since, recordLimit);
            const ohlcv = reshape(rawOHLCV);
            const diff = (ohlcv[1].timestamp - ohlcv[0].timestamp); 
            since = ohlcv[ohlcv.length - 1].timestamp + diff;
            
            console.log(`Fetch ${ohlcv.length} records`);
            
            recrodsToFetch -= ohlcv.length;
            allTrades = [...allTrades, ...ohlcv];
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
