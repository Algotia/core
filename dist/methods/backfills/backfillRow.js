"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function BackfillRow(data) {
    function format(timeMs) {
        return new Date(timeMs).toLocaleString();
    }
    const { name, period, pair, since, until } = data;
    this["name"] = name;
    this.records = data.userCandles.length;
    this.period = period;
    this.pair = pair;
    this["since (formatted)"] = format(since);
    this["until (formatted)"] = format(until);
}
exports.default = BackfillRow;
