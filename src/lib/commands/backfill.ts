import { program } from "commander"
import { MongoClient } from "mongodb"
import readline from 'readline'
import log from 'fancy-log'
import gray from "ansi-gray"
import timestamp from "time-stamp" 

import { convertTimeFrame } from '../../utils/index'

//TODO: Probably should split some of these utility functions out as they will be useful in a bunch of other modules. 

interface Options {
  since: number,
  pair: string,
  until: number,
  period: string,
  recordLimit: number,
  name: string,
}

interface OHLCV {
  timestamp: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}

const reshape = (arr: OHLCV[]) => (arr.map((ohlcv: OHLCV) => ({
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
          name
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
        
        const dbUrl = "mongodb://localhost:27017"
        const dbName = "algotia"
        const dbOptions = {
          useUnifiedTopology: true
        }
        const client = new MongoClient(dbUrl, dbOptions)

        await client.connect()

        const db = client.db(dbName)
        
        const backfillCollection = db.collection('backfill')
        
        let docName: string;
        if (name) {
          docName = name;
        } else {
          const format = (time: number) => new Date(time).toLocaleString().replace(",", "");
          const startDate = format(since);
          const endDate = format(until);
          docName = `${startDate} --> ${endDate} ${pair} ${period}`
        }
      
        await backfillCollection.insertOne({
            name: docName,
            period,
            pair,
            since,
            until,
            records: allTrades
        });
        
      log(`Wrote ${allTrades.length} records to ${docName}`);
      client.close();
      process.exit(0);
    }
    catch (err) {
        log.error(err)
    }
}


