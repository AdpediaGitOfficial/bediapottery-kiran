"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlockedTime = exports.createBlockedTime = exports.getPublicBlockedTimes = exports.getBlockedTimes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const blockedTimeUseCase_1 = require("../useCases/blockedTimeUseCase");
exports.getBlockedTimes = (0, express_async_handler_1.default)(async (req, res) => {
    const blockedTimes = await (0, blockedTimeUseCase_1.getBlockedTimesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched blocked times successfully',
        result: blockedTimes,
    });
});
exports.getPublicBlockedTimes = (0, express_async_handler_1.default)(async (req, res) => {
    const blockedTimes = await (0, blockedTimeUseCase_1.getPublicBlockedTimesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched blocked times successfully',
        result: blockedTimes,
    });
});
exports.createBlockedTime = (0, express_async_handler_1.default)(async (req, res) => {
    const blockedTime = await (0, blockedTimeUseCase_1.createBlockedTimeUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Blocked time created successfully',
        result: blockedTime,
    });
});
exports.deleteBlockedTime = (0, express_async_handler_1.default)(async (req, res) => {
    await (0, blockedTimeUseCase_1.deleteBlockedTimeUseCase)(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Blocked time removed successfully',
        result: true,
    });
});
