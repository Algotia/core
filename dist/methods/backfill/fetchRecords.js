"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const retrieveCandles = (retrieveOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { options, exchange, onStartMessage, onUpdateMessage, onDoneMessage } = retrieveOptions;
    const { sinceMs, period, periodMs, pair, recordsToFetch, recordLimit = exchange.historicalRecordLimit, verbose } = options;
    let allRecords = [];
    let sinceCursor = sinceMs;
    let recordsLeftToFetch = recordsToFetch;
    let numberOfRecordsToFetch = recordLimit;
    verbose && onStartMessage && utils_1.log.info(onStartMessage(recordsLeftToFetch));
    while (recordsLeftToFetch) {
        if (recordLimit > recordsLeftToFetch)
            numberOfRecordsToFetch = recordsLeftToFetch;
        const rawOHLCV = yield exchange.fetchOHLCV(pair, period, sinceCursor, numberOfRecordsToFetch);
        const ohlcvArr = utils_1.reshapeOHLCV(rawOHLCV);
        sinceCursor += ohlcvArr.length * periodMs;
        recordsLeftToFetch -= ohlcvArr.length;
        allRecords.push(...ohlcvArr);
        verbose && onUpdateMessage && utils_1.log.info(onUpdateMessage(recordsLeftToFetch));
        // wrapper should have rate limit length
        yield utils_1.sleep(1000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
    }
    verbose && onDoneMessage && utils_1.log.info(onDoneMessage(recordsToFetch));
    return allRecords;
});
const fetchRecords = (exchange, userOptions, internalOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //return await retrieveCandles(exchange, fetchOptions);
        const userCandlesPromise = retrieveCandles({
            exchange,
            options: userOptions,
            onStartMessage: (recordsLeftToFetch) => {
                return `Fetching ${recordsLeftToFetch} records`;
            },
            onUpdateMessage: (recordsLeftToFetch) => {
                return `${recordsLeftToFetch} records to fetch`;
            },
            onDoneMessage: (recordsFetched) => {
                return `Fetched ${recordsFetched} records`;
            }
        });
        const internalCandlesPromise = retrieveCandles({
            exchange,
            options: internalOptions,
            onStartMessage: (x) => {
                return "Fetching records for internal use " + x;
            },
            onUpdateMessage: (x) => {
                return x + " left for internal";
            },
            onDoneMessage: () => {
                return "Done fetching records for internal use";
            }
        });
        const [userCandles, internalCandles] = yield Promise.all([
            userCandlesPromise,
            internalCandlesPromise
        ]);
        return { userCandles, internalCandles };
    }
    catch (err) {
        throw err;
    }
});
exports.default = fetchRecords;
