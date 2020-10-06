import algotiaLogger from "./logger";
import { AnyAlgotia, Config } from "../../types";
import { inspect } from "util";

interface AnyObj {
	[key: string]: any;
}

interface MessageObj {
	label: string;
	value: AnyObj;
}

interface DebugLogOptions {
	depth?: number;
}

const isAlgotia = (obj: any): obj is AnyAlgotia => {
	if (obj.config) {
		return true;
	}
};

const debugLog = (
	algotia: AnyAlgotia | Config,
	message: string | MessageObj,
	level?: "error" | "arguments" | "return_value" | "info",
	meta?: AnyObj,
	opts?: DebugLogOptions
): void => {
	let conf: Config;
	if (isAlgotia(algotia)) {
		conf = algotia.config;
	} else {
		conf = algotia;
	}
	if (conf.debug === true) {
		let formattedMessage: any;
		if (typeof message === "object") {
			const depth = opts && opts.depth ? opts.depth : 0;
			// super hacky way to indent object (specifically inspect() objects)
			formattedMessage =
				message.label +
				" \n " +
				" \t" +
				inspect(message.value, false, depth, true).replace(/\n\r?/g, "\n\t");
		} else {
			formattedMessage = message;
		}
		algotiaLogger.debug.log(level || "info", formattedMessage, meta);
	}
};

export default debugLog;
