"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const l = __importStar(require("fancy-log"));
function log(message) {
    if (message)
        l.default(message);
}
log.info = (text) => {
    l.info(chalk_1.default.yellow.bold("INFO: "), text);
};
log.error = (text) => {
    l.error(chalk_1.default.red.bold("ERROR: "), text);
};
log.warn = (text) => {
    l.warn(chalk_1.default.yellow.bold("WARNING: "), text);
};
log.success = (text) => {
    l.default(chalk_1.default.green.bold("SUCCESS: "), text);
};
exports.default = log;
