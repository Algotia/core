"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const flat_1 = __importDefault(require("flat"));
const encodeObject = (obj) => {
    const flattened = flat_1.default(obj);
    const stringified = index_1.stringifyObject(flattened);
    return stringified;
};
exports.default = encodeObject;
