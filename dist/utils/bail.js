"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
function bail(message, signal = "SIGINT") {
    fancy_log_1.default.error(`Exiting Algotia. \n Error: ${message}`);
    process.kill(process.pid, signal);
}
exports.default = bail;
