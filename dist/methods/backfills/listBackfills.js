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
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const getOneBackfill = (backfillCollection, documentName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const oneBackfill = yield backfillCollection.findOne({
            name: documentName
        });
        return [oneBackfill];
    }
    catch (err) {
        throw err;
    }
});
const getAllBackfills = (backfillCollection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allBackfills = yield backfillCollection
            .find({})
            .toArray();
        return allBackfills;
    }
    catch (err) {
        throw err;
    }
});
const listBackfills = (bootData, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mongoClient } = bootData;
        const backfillCollection = yield utils_1.getBackfillCollection(mongoClient);
        if (options && options.documentName) {
            // List one
            const oneBackfill = yield getOneBackfill(backfillCollection, options.documentName);
            if (oneBackfill) {
                return oneBackfill;
            }
            else {
                throw new types_1.InputError(`No backfill named ${options.documentName} saved.`);
            }
        }
        else {
            // List all
            const allBackfills = yield getAllBackfills(backfillCollection);
            if (allBackfills.length) {
                return allBackfills;
            }
            else {
                return [];
            }
        }
    }
    catch (err) {
        throw err;
    }
});
exports.default = listBackfills;
