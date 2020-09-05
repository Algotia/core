"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const listBackfills_1 = __importDefault(require("./listBackfills"));
const deleteBackfills_1 = __importDefault(require("./deleteBackfills"));
const backfills = {
    listBackfills: listBackfills_1.default,
    deleteBackfills: deleteBackfills_1.default
};
exports.default = backfills;
