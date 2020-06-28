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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const mongodb_1 = require("mongodb");
const readline_1 = __importDefault(require("readline"));
const fancy_log_1 = __importDefault(require("fancy-log"));
const ansi_gray_1 = __importDefault(require("ansi-gray"));
const time_stamp_1 = __importDefault(require("time-stamp"));
const index_1 = require("../../utils/index");
const reshape = (arr) => arr.map((ohlcv) => ({
    timestamp: ohlcv[0],
    open: ohlcv[1],
    high: ohlcv[2],
    low: ohlcv[3],
    close: ohlcv[4],
    volume: ohlcv[5]
}));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // This is a sync function that WILL block the main thread, might want to do something else instead
exports.default = (exchange, opts) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // De structure mutable and immutable properties separately
        const { pair, until, period, name } = opts;
        let { since, recordLimit } = opts;
        const allowedTimeframes = Object.keys(exchange.timeframes);
        if (!allowedTimeframes.includes(period))
            throw new Error("Period does not exist as an exchange timeframe");
        if (since > until)
            throw new Error("Invalid date: parameter since cannot be less than until");
        const unitsMs = {
            minute: 60000,
            hour: 3600000,
            day: 86400000
        };
        const msDiff = until - since;
        const { unit, ammount } = index_1.convertTimeFrame(period);
        const periodMs = unitsMs[unit] * ammount;
        let recrodsToFetch = Math.round(msDiff / periodMs);
        fancy_log_1.default.info(`Records to fetch ${recrodsToFetch}`);
        let allTrades = [];
        yield sleep(500);
        while (since < until) {
            if (recordLimit > recrodsToFetch)
                recordLimit = recrodsToFetch;
            const rawOHLCV = yield exchange.fetchOHLCV(pair, period, since, recordLimit);
            const ohlcv = reshape(rawOHLCV);
            since = ohlcv[ohlcv.length - 1].timestamp + periodMs;
            if (commander_1.program.verbose)
                fancy_log_1.default(`Fetched ${ohlcv.length} records`);
            readline_1.default.cursorTo(process.stdout, 0);
            process.stdout.write(`[${ansi_gray_1.default(time_stamp_1.default("HH:mm:ss"))}] ${recrodsToFetch} records left to fetch...`);
            recrodsToFetch -= ohlcv.length;
            allTrades = [...allTrades, ...ohlcv];
            // we should know what the rate limit of each exchange is.
            yield sleep(2000); // must sleep to avoid get rate limited on SOME EXCHANGES (check exchange API docs).
        }
        console.log();
        const dbUrl = "mongodb://localhost:27017";
        const dbName = "algotia";
        const dbOptions = {
            useUnifiedTopology: true
        };
        const client = new mongodb_1.MongoClient(dbUrl, dbOptions);
        yield client.connect();
        const db = client.db(dbName);
        const backfillCollection = db.collection("backfill");
        let docName;
        if (name) {
            docName = name;
        }
        else {
            const format = (time) => new Date(time).toLocaleString().replace(",", "");
            const startDate = format(since);
            const endDate = format(until);
            docName = `${startDate} --> ${endDate} ${pair} ${period}`;
        }
        yield backfillCollection.insertOne({
            name: docName,
            period,
            pair,
            since,
            until,
            records: allTrades
        });
        fancy_log_1.default(`Wrote ${allTrades.length} records to ${docName}`);
        client.close();
        process.exit(0);
    }
    catch (err) {
        fancy_log_1.default.error(err);
    }
});
