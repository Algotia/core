import { convertDateToTimestamp }  from '../utils/index'
import backfill from './commands/backfill'
import { program } from "commander"

const pInt = (str: string) =>  parseInt(str);
const pDate = (str: string) => convertDateToTimestamp(str);

// should create an interface for this
export default (bootData) => {
  const { exchange } = bootData;
  program.version('0.0.1');

  program
      .option('-v, --verbose', 'verbose output')
      .option('-c, --config <config>')
      .command('backfill')
      .description('backfill historical data')
      .requiredOption('-s, --since <since>', 'Unix timestamp (ms) of time to retrieve records from', pDate)
      .requiredOption('-p, --pair <pair>', 'Pair to retrieve records for') 
      .option('-P, --period <period>', 'Timeframe to retrieve records for', '1m')
      .option('-u, --until <until>', 'Unix timestamp (ms) of time to retrieve records to', pDate, exchange.milliseconds())
      .option('-l, --limit <limit>', 'Number of records to retrieve at one time', pInt, 10)
      .option('-n, --collection-name <collectionName>', 'name for database refrence', undefined)
      .action(async (options) => {
          const {
            since,
            pair,
            period,
            until,
            limit,
            collectionName,
          }:
          {
            since: number,
            pair: string,
            period: string,
            until: number,
            limit: number,
            collectionName: string
          }= options

          const opts = {
            since,
            pair,
            period,
            until,
            recordLimit: limit,
            name: collectionName,
          }
          
          await backfill(exchange, opts)
      })



  program.parse(process.argv);

  return program
}
