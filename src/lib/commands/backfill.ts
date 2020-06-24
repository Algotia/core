import log from 'fancy-log'
import { program } from "commander"
import readline from 'readline'
import timestamp from "time-stamp" 
import { convertTimeFrame } from '../../utils/index'
import gray from "ansi-gray"

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
         

        // De structure mutable and immutable properties separately
        const {
          pair,                       
          until,
          period,
        } = opts;

        let {
          since,                           
          recordLimit, 
        } = opts; 
        
        const allowedTimeframes = Object.keys(exchange.timeframes);
        if (!allowedTimeframes.includes(period)) throw new Error('Period does not exist as an exchange timeframe');

        const unitsMs = {
            minute: 60000,
            hour: 3600000,
            day: 86400000
        };

        const msDiff = until - since;
        const {unit, ammount }= convertTimeFrame(period);
        const periodMs = (unitsMs[unit] * ammount);

        let recrodsToFetch = Math.round((msDiff / periodMs));

        log.info(`Records to fetch ${recrodsToFetch}`);
        
        let allTrades = [];

        await sleep(500);

        while (since < until) {
            
            if (recordLimit > recrodsToFetch) recordLimit = recrodsToFetch;
              
            const rawOHLCV = await exchange.fetchOHLCV(pair, period, since, recordLimit);
            const ohlcv = reshape(rawOHLCV);

            since = ohlcv[ohlcv.length - 1].timestamp + periodMs;
            
            if (program.verbose) log(`Fetched ${ohlcv.length} records`);

            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`[${gray(timestamp("HH:mm:ss"))}] ${recrodsToFetch} records left to fetch...`)

            recrodsToFetch -= ohlcv.length;
            allTrades = [...allTrades, ...ohlcv];
            // we should know what the rate limit of each exchange is.
            await sleep(2000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).

        }
        console.log()
        log(`Fetched ${allTrades.length} trades`);

    }
    catch (err) {
        log.error(err)
    }
}


