import log from 'fancy-log'

export default function bail(message, signal: string | number = "SIGINT") {
	log.error(`Exiting Algotia. \n Error: ${message}`);
	process.kill(process.pid, signal);
}
