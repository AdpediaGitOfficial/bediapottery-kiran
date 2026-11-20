"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpeningHoursById = exports.deleteOpeningHoursById = exports.updateOpeningHoursById = exports.createOpeningHours = exports.getAllOpeningHoursForAdmin = exports.getAllOpeningHours = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const openingHoursUseCase_1 = require("../useCases/openingHoursUseCase");
exports.getAllOpeningHours = (0, express_async_handler_1.default)(async (req, res) => {
    const openingHours = await (0, openingHoursUseCase_1.getAllOpeningHoursUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All OpeningHours successfully',
        result: openingHours,
    });
});
exports.getAllOpeningHoursForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const openingHours = await (0, openingHoursUseCase_1.getAllOpeningHoursForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All OpeningHours successfully',
        result: openingHours,
    });
});
exports.createOpeningHours = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, openingHoursUseCase_1.createOpeningHoursUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created OpeningHours successfully',
        result: true,
    });
});
exports.updateOpeningHoursById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, openingHoursUseCase_1.updateOpeningHoursByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated OpeningHours successfully',
        result: true,
    });
});
exports.deleteOpeningHoursById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, openingHoursUseCase_1.deleteOpeningHoursByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted OpeningHours successfully',
        result: true,
    });
});
exports.getOpeningHoursById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const openingHours = await (0, openingHoursUseCase_1.getOpeningHoursByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched OpeningHours successfully',
        result: openingHours,
    });
});
