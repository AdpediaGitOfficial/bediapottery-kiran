"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyNewUsersChart = exports.getDashboardStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const httpStatus_1 = require("../../common/httpStatus");
const dashboardUseCase_1 = require("../useCases/dashboardUseCase");
exports.getDashboardStats = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, dashboardUseCase_1.getDashboardStatsUseCase)();
    res.status(httpStatus_1.HttpStatus.OK).json({
        success: true,
        message: 'Dashboard stats fetched successfully',
        result,
    });
});
exports.getDailyNewUsersChart = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, dashboardUseCase_1.getDailyNewUsersChartUseCase)();
    res.status(httpStatus_1.HttpStatus.OK).json({
        success: true,
        message: 'Chart data fetched successfully',
        result,
    });
});
