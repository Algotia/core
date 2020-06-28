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
const ccxt_1 = __importDefault(require("ccxt"));
const fs_1 = __importDefault(require("fs"));
const ajv_1 = __importDefault(require("ajv"));
const fancy_log_1 = __importDefault(require("fancy-log"));
const mongodb_1 = require("mongodb");
const index_1 = require("../utils/index");
exports.default = (userConfig, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = validateConfig(userConfig, options.verbose);
        const exchange = yield connectExchange(config);
        yield connectStore();
        const bootData = {
            config,
            exchange,
        };
        return bootData;
    }
    catch (err) {
        console.log("Error in boot phase: ", err);
    }
});
const validateConfig = (userConfig, verbose) => {
    // schema is generated at build-time with typescript-json-schema
    const schemaFile = fs_1.default.readFileSync(`${__dirname}/../config/config.schema.json`, "utf8");
    const configSchema = JSON.parse(schemaFile);
    const ajv = new ajv_1.default();
    const validate = ajv.compile(configSchema);
    const valid = validate(userConfig);
    if (valid) {
        if (verbose)
            fancy_log_1.default("Configuration validated");
        return userConfig;
    }
    else {
        validate.errors.forEach((errObj) => {
            fancy_log_1.default.error(`Error while validating schema: ${errObj.dataPath}: ${errObj.message}`);
        });
        index_1.bail("Schema invlaid");
    }
};
const connectExchange = (config) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
        const exchange = new ccxt_1.default[exchangeId]({
            apiKey,
            secret: apiSecret,
            timeout,
        });
        return exchange;
    }
    catch (err) {
        fancy_log_1.default.error(err);
    }
});
const connectStore = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = "mongodb://localhost:27017";
        const dbname = "algotia";
        const options = {
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 7500,
            heartbeatFrequencyMS: 2000,
        };
        const client = new mongodb_1.MongoClient(url, options);
        yield client.connect();
        client.db(dbname);
        yield client.close();
    }
    catch (err) {
        if (err.message === "connect ECONNREFUSED 127.0.0.1:27017") {
            index_1.bail("Ensure that the mongodb daemon process is running and open on port 27017.");
        }
        index_1.bail("Error connecting to database: ", err);
    }
});
