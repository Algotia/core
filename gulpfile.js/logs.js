const chalk = require("chalk");
const log = require("fancy-log");

const info = (message) => {
	log(chalk.yellow("INFO: ") + message);
};

const success = (message) => {
	log(chalk.green("SUCCESS: ") + message);
};

const error = (message) => {
	log(chalk.red("ERROR: ") + message);
};

module.exports = {
	info,
	success,
	error,
};
