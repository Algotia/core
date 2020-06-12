import dotenv from "dotenv";
import boot from "./boot";
import createStrategy from "./lib/createStrategy";
import program from './lib/cli';
import backfill from './lib/commands/backfill';

(async () => {
	try {
		const { exchange, config, store } = await boot();
		const { args } = program;

		if (program.backfill) {
			backfill(exchange);
		}


	} catch (err) {
		console.log(err);
	}
})();
