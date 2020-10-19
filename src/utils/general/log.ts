import winston, { format, transports } from "winston";
import { homedir } from "os";

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
	format: format.cli(),
	transports: [new transports.Console()],
});

const log = {
	ccxtError: CcxtErrorLogger,
	standard: StandardLogger,
};

export default log;
