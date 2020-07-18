import boot from "./lib/boot";
import { backfill, backfills, backtest } from "./lib/methods/index";
import {
	BootOptions,
	ConfigOptions,
	BackfillOptions,
	DeleteOptions,
	ListOptions,
	BacktestOtions
} from "./types/index";

export {
	// methods
	boot,
	backfill,
	backfills,
	backtest,
	// types
	BootOptions,
	ConfigOptions,
	BackfillOptions,
	DeleteOptions,
	ListOptions,
	BacktestOtions
};
