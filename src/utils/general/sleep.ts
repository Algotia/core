// This is a sync function that WILL block the main thread
import { log } from "./index";
export default (ms: number, verbose?: boolean) => {
	if (verbose) log.info(`Sleeping for ${ms / 1000} seconds.`);
	return new Promise((resolve) => setTimeout(resolve, ms));
};
