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
const index_1 = require("../../utils/index");
const convertOptions_1 = __importDefault(require("./convertOptions"));
const fetchRecords_1 = __importDefault(require("./fetchRecords"));
const insertDocument_1 = __importDefault(require("./insertDocument"));
const validateOptions_1 = __importDefault(require("./validateOptions"));
// Converts and validates input and returns converted and valid options
const processInput = (exchange, backfillInput) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const internalOptions = convertOptions_1.default(backfillInput, exchange, true);
        const userOptions = convertOptions_1.default(backfillInput, exchange);
        yield validateOptions_1.default(exchange, userOptions);
        return { internalOptions, userOptions };
    }
    catch (err) {
        throw err;
    }
});
const backfill = (bootData, backfillOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exchange, mongoClient } = bootData;
        const { verbose } = backfillOptions;
        const { userOptions, internalOptions } = yield processInput(exchange, backfillOptions);
        verbose && index_1.log.info(`Records to fetch ${userOptions.recordsToFetch}`);
        const { userCandles, internalCandles } = yield fetchRecords_1.default(exchange, userOptions, internalOptions);
        const insertOptions = {
            userOptions,
            userCandles,
            internalCandles
        };
        if (userCandles && internalCandles) {
            const document = yield insertDocument_1.default(insertOptions, mongoClient);
            verbose &&
                index_1.log.success(`Wrote document ${document.name} to the backfill collection`);
            return document;
        }
    }
    catch (err) {
        throw err;
    }
});
exports.default = backfill;
