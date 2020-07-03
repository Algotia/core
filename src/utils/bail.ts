import { log } from "./index";

export default function bail(
	message?: any,
	signal: string | number = "SIGINT"
) {
	if (message) log.error(message);
	log.info(`Exiting Algotia.`);

	process.kill(process.pid, signal);
}
