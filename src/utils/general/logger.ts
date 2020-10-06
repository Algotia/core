import winston, { format, transports } from "winston";
import chalk from "chalk";

const CcxtErrorLogger = winston.createLogger({
	level: "error",
	format: format.json(),
	defaultMeta: { origin: "Ccxt" },
	transports: [
		new transports.Console(),
		new transports.File({ filename: "ccxt_error.log", level: "error" }),
	],
});

const StandardLogger = winston.createLogger({
	level: "info",
	format: format.json(),
	transports: [new transports.Console()],
});

const debugLevels = {
	levels: {
		error: 0,
		arguments: 1,
		return_value: 2,
		info: 3,
	},
	colors: {
		error: "red",
		arguments: "blue",
		return_value: "green",
		info: "magenta",
	},
};

const DebugLogger = winston.createLogger({
	level: "info",
	levels: debugLevels.levels,
	format: format.combine(
		format.colorize(),
		format.label({ label: "DEBUG" }),
		format.timestamp(),
		format.printf(({ level, message, label, timestamp }) => {
			const styledLabel = chalk.yellow(label);
			const formattedTimestamp = new Date(timestamp).toLocaleTimeString();
			return `${styledLabel} ${formattedTimestamp} | ${level}: ${message}`;
		})
	),
	transports: [new transports.Console()],
});
winston.addColors(debugLevels.colors);

const logger = {
	ccxtError: CcxtErrorLogger,
	standard: StandardLogger,
	debug: DebugLogger,
};

export default logger;
