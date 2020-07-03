import chalk from "chalk";
import log from "fancy-log";

type T = any;

const info = (text: T) => {
	log.info(chalk.yellow.bold("INFO: "), text);
};

const error = (text: T) => {
	log.error(chalk.red.bold("ERROR: "), text);
};

const warn = (text: T) => {
	log.warn(chalk.yellow.bold("WARNING: "), text);
};

const success = (text: T) => {
	log(chalk.green.bold("SUCCESS: "), text);
};

export default {
	info,
	error,
	warn,
	success
};
