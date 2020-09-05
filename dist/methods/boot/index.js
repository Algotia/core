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
const validateConfig_1 = __importDefault(require("./validateConfig"));
const connectExchange_1 = __importDefault(require("./connectExchange"));
const createClient_1 = __importDefault(require("./createClient"));
const createEventBus_1 = __importDefault(require("./createEventBus"));
const createRedisClient_1 = __importDefault(require("./createRedisClient"));
const boot = (configInput) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = validateConfig_1.default(configInput);
        const exchange = yield connectExchange_1.default(configInput);
        const mongoClient = yield createClient_1.default(config);
        const eventBus = createEventBus_1.default();
        const redisClient = createRedisClient_1.default();
        const quit = () => {
            mongoClient.close();
            redisClient.close();
        };
        const bootData = {
            config,
            exchange,
            mongoClient,
            eventBus,
            redisClient,
            quit
        };
        return bootData;
    }
    catch (err) {
        throw err;
    }
});
exports.default = boot;
