"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../utils/index");
// Converts input into friendly format
const convertOptions = (backfillOptions, exchange, internal) => {
    let options;
    if (internal === true) {
        options = Object.assign({}, backfillOptions);
        const newSince = index_1.convertDateInputToMs(backfillOptions.since) +
            index_1.convertPeriodToMs(backfillOptions.period);
        options.since = new Date(newSince).toISOString();
        const newUntil = index_1.convertDateInputToMs(backfillOptions.until) +
            index_1.convertPeriodToMs(backfillOptions.period);
        options.until = new Date(newUntil).toISOString();
        options.period = "1m";
    }
    else {
        options = Object.assign({}, backfillOptions);
    }
    const { since, until, pair, period, recordLimit, verbose } = options;
    const periodMs = index_1.convertPeriodToMs(period);
    let sinceMs;
    let untilMs;
    if (exchange.id === "bitstamp") {
        sinceMs = index_1.convertDateInputToMs(since) - 1;
        untilMs = index_1.convertDateInputToMs(until) - 1;
    }
    else {
        sinceMs = index_1.convertDateInputToMs(since);
        untilMs = index_1.convertDateInputToMs(until);
    }
    const msBetween = untilMs - sinceMs;
    const recordsToFetch = Math.floor(msBetween / periodMs);
    const convertedOptions = {
        since,
        until,
        untilMs,
        sinceMs,
        period,
        periodMs,
        pair,
        recordLimit,
        recordsToFetch,
        verbose
    };
    return convertedOptions;
};
exports.default = convertOptions;
