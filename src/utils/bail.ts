export default function bail(message, signal: string | number = "SIGINT") {
	console.log(`Exiting Algotia. \n Error: ${message}`);
	process.kill(process.pid, signal);
}
