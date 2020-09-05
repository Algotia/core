"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyObject = (flatObj) => {
    let stringObj = {};
    for (const key in flatObj) {
        stringObj[key] = flatObj[key].toString();
    }
    return stringObj;
};
exports.default = stringifyObject;
