import { program } from 'commander';
import backfill from './commands/backfill'

const pInt = (str: string) =>  parseInt(str);

export default (bootData) => {
  const { exchange } = bootData;
  program.version('0.0.1');

  program
      .command('backfill')
      .description('backfill historical data')
      .option('-s, --since <since>', 'Unix timestamp (ms) of time to retrieve records from', pInt)
      .option('-p, --pair <pair>', 'Pair to retrieve records for') 
      .option('-P, --period <period>', 'Timeframe to retrieve records for', '1m')
      .option('-u, --until <until>', 'Unix timestamp (ms) of time to retrieve records to', pInt, exchange.milliseconds())
      .option('-l, --limit <limit>', 'Number of records to retrieve at one time', pInt, 10)
      .action(async (options) => {
          const {
            since,
            pair,
            period,
            until,
            limit
          }:
          {
            since: number,
            pair: string,
            period: string,
            until: number,
            limit: number
          }= options

          const opts = {
            since,
            pair,
            period,
            until,
            recordLimit: limit
          }
          
          await backfill(exchange, opts)
      })



  program.parse(process.argv);

  return program
}
