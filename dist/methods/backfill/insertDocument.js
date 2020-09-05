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
const insertDocument = (insertOptions, client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userOptions, userCandles, internalCandles } = insertOptions;
        const { sinceMs, untilMs, period, pair, documentName } = userOptions;
        const backfillCollection = yield utils_1.getBackfillCollection(client);
        const docCount = yield backfillCollection.countDocuments();
        const docName = documentName || `backfill-${docCount + 1}`;
        const backfillDocument = {
            name: docName,
            since: sinceMs,
            until: untilMs,
            userCandles,
            internalCandles,
            period,
            pair
        };
        yield backfillCollection.insertOne(backfillDocument);
        return backfillDocument;
    }
    catch (err) {
        utils_1.log.error(err);
    }
});
exports.default = insertDocument;
