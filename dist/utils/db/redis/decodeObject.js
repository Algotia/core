"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flat_1 = require("flat");
const decodeObject = (flatObj) => {
    let newObj = {};
    for (const key in flatObj) {
        const item = flatObj[key];
        let value;
        if (isNaN(Number(item))) {
            value = item;
        }
        else {
            value = Number(item);
        }
        newObj[key] = value;
    }
    const decoded = flat_1.unflatten(newObj);
    return decoded;
};
exports.default = decodeObject;
