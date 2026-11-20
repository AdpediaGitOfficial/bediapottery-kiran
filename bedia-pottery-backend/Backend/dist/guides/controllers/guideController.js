"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideById = exports.deleteGuideById = exports.updateGuideById = exports.createGuide = exports.getAllGuidesForAdmin = exports.getSingleGuide = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const guideUseCase_1 = require("../useCases/guideUseCase");
exports.getSingleGuide = (0, express_async_handler_1.default)(async (req, res) => {
    const queryParams = req.query;
    const guides = await (0, guideUseCase_1.getSingleGuideUseCase)(queryParams);
    res.status(200).json({
        success: true,
        message: 'Fetched Guide successfully',
        result: guides,
    });
});
exports.getAllGuidesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const queryParams = req.query;
    const guides = await (0, guideUseCase_1.getAllGuidesForAdminUseCase)(queryParams);
    res.status(200).json({
        success: true,
        message: 'Fetched All Guides successfully',
        result: guides,
    });
});
exports.createGuide = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, guideUseCase_1.createGuideUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Guide successfully',
        result: true,
    });
});
exports.updateGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, guideUseCase_1.updateGuideByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Guide successfully',
        result: true,
    });
});
exports.deleteGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, guideUseCase_1.deleteGuideByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Guide successfully',
        result: true,
    });
});
exports.getGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const guide = await (0, guideUseCase_1.getGuideByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Guide successfully',
        result: guide,
    });
});
