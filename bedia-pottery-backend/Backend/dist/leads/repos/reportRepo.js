"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLatestReport = void 0;
const reportModel_1 = __importDefault(require("../../report/models/reportModel"));
const fetchLatestReport = async () => {
    return await reportModel_1.default.findOne({ isDeleted: false }).sort({ createdAt: -1 }).select({
        __v: 0,
        isDeleted: 0,
        createdAt: 0,
    });
};
exports.fetchLatestReport = fetchLatestReport;
