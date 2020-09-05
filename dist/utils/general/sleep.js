"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.default = sleep;
