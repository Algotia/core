"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
// This function takes in an exchange timeframe (e.g. 1m, 5m, 1h, 1d, etc.)
// and converts it into an object e.g. { unit: "minute", amount: 1}
var Unit;
(function (Unit) {
    Unit["Minute"] = "minute";
    Unit["Hour"] = "hour";
    Unit["Day"] = "day";
    Unit["Week"] = "week";
})(Unit || (Unit = {}));
const converPeriodToMs = (period) => {
    const amount = parseInt(period.replace(/[^0-9\.]+/g, ""), 10);
    let unit;
    switch (period.replace(/[0-9]/g, "")) {
        case "m":
            unit = Unit.Minute;
            break;
        case "h":
            unit = Unit.Hour;
            break;
        case "d":
            unit = Unit.Day;
            break;
        case "w":
            unit = Unit.Week;
            break;
    }
    const periodMs = _1.msUnits[unit] * amount;
    return periodMs;
};
exports.default = converPeriodToMs;
