"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.uploadReport = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reportUseCase_1 = require("../useCases/reportUseCase");
exports.uploadReport = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
    }
    const response = await (0, reportUseCase_1.uploadReportUseCase)(req.files);
    res.status(200).json({
        success: true,
        message: 'Report uploaded successfully',
        result: response,
    });
});
exports.getReport = (0, express_async_handler_1.default)(async (req, res) => {
    const response = await (0, reportUseCase_1.getReportUseCase)();
    res.status(200).json({
        success: true,
        message: 'Report fetched successfully',
        result: response,
    });
});
