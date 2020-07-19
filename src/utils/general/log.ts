import chalk from "chalk";
import * as l from "fancy-log";

type T = any;

function log(message?: T) {
	if (message) l.default(message);
}

log.info = (text: T) => {
	l.info(chalk.yellow.bold("INFO: "), text);
};

log.error = (text: T) => {
	l.error(chalk.red.bold("ERROR: "), text);
};

log.warn = (text: T) => {
	l.warn(chalk.yellow.bold("WARNING: "), text);
};

log.success = (text: T) => {
	l.default(chalk.green.bold("SUCCESS: "), text);
};

export default log;
