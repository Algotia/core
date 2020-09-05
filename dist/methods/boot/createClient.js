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
const mongodb_1 = require("mongodb");
const createClient = (configInput) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const port = configInput.db.port || 27017;
        //const dbUrl = `mongodb://localhost:${port}`;
        const dbUrl = process.env.NODE_ENV === "test"
            ? process.env.MONGO_URL
            : `mongodb://localhost:${port}`;
        const dbOptions = {
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 7500,
            heartbeatFrequencyMS: 2000
        };
        const client = new mongodb_1.MongoClient(dbUrl, dbOptions);
        !client.isConnected() && (yield client.connect());
        client.db("algotia");
        return client;
    }
    catch (err) {
        throw err;
    }
});
exports.default = createClient;
