"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrochureById = exports.deleteBrochureById = exports.updateBrochureById = exports.createBrochure = exports.getAllBrochuresForAdmin = exports.getAllBrochures = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const brochureUseCase_1 = require("../useCases/brochureUseCase");
exports.getAllBrochures = (0, express_async_handler_1.default)(async (req, res) => {
    const brochures = await (0, brochureUseCase_1.getAllBrochuresUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Brochures successfully',
        result: brochures,
    });
});
exports.getAllBrochuresForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const brochures = await (0, brochureUseCase_1.getAllBrochuresForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Brochures successfully',
        result: brochures,
    });
});
exports.createBrochure = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, brochureUseCase_1.createBrochureUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Brochure successfully',
        result: true,
    });
});
exports.updateBrochureById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, brochureUseCase_1.updateBrochureByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Brochure successfully',
        result: true,
    });
});
exports.deleteBrochureById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, brochureUseCase_1.deleteBrochureByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Brochure successfully',
        result: true,
    });
});
exports.getBrochureById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const brochure = await (0, brochureUseCase_1.getBrochureByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Brochure successfully',
        result: brochure,
    });
});
