"use strict";
// This function take in a string and attempts to convert it into a date
// first tries to convert a JavaScript Date
// then tries a unix timestamp
Object.defineProperty(exports, "__esModule", { value: true });
const convertDateInputToMs = (input) => {
    const numFromInput = Number(input);
    let date;
    const checkIfNan = (num) => Object.is(NaN, num);
    if (checkIfNan(numFromInput)) {
        // Input is a string
        date = new Date(input);
    }
    else {
        // Input is a number
        date = new Date(numFromInput);
    }
    if (checkIfNan(date.valueOf())) {
        // Invalid date
        return 0;
    }
    else {
        // Valid date
        const timestamp = date.getTime();
        return timestamp;
    }
};
exports.default = convertDateInputToMs;
