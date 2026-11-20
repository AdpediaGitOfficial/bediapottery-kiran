"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAreaGuideByName = exports.getAreaGuideMetaBySlug = exports.getAreaGuideBySlug = exports.getAreaGuideById = exports.deleteAreaGuideById = exports.updateAreaGuideById = exports.createAreaGuide = exports.getAllAreaGuidesForAdmin = exports.getAllAreaGuides = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const areaGuideUseCase_1 = require("../useCases/areaGuideUseCase");
exports.getAllAreaGuides = (0, express_async_handler_1.default)(async (req, res) => {
    const areaGuides = await (0, areaGuideUseCase_1.getAllAreaGuidesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All area guides successfully',
        result: areaGuides,
    });
});
exports.getAllAreaGuidesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const areaGuides = await (0, areaGuideUseCase_1.getAllAreaGuidesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All area guides successfully',
        result: areaGuides,
    });
});
exports.createAreaGuide = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, areaGuideUseCase_1.createAreaGuideUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created area guide successfully',
        result: true,
    });
});
exports.updateAreaGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, areaGuideUseCase_1.updateAreaGuideByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated area guide successfully',
        result: true,
    });
});
exports.deleteAreaGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, areaGuideUseCase_1.deleteAreaGuideByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted area guide successfully',
        result: true,
    });
});
exports.getAreaGuideById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const areaGuide = await (0, areaGuideUseCase_1.getAreaGuideByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched area guide successfully',
        result: areaGuide,
    });
});
exports.getAreaGuideBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const areaGuide = await (0, areaGuideUseCase_1.getAreaGuideBySlugUseCase)({ slug });
    res.status(200).json({
        success: true,
        message: 'Fetched area guide successfully',
        result: areaGuide,
    });
});
exports.getAreaGuideMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const areaGuide = await (0, areaGuideUseCase_1.getAreaGuideMetaBySlugUseCase)({ slug });
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: areaGuide,
    });
});
exports.getAreaGuideByName = (0, express_async_handler_1.default)(async (req, res) => {
    const name = req.query.name;
    const areaGuide = await (0, areaGuideUseCase_1.getAreaGuideByNameUseCase)({ name });
    res.status(200).json({
        success: true,
        message: 'Fetched area guide successfully',
        result: areaGuide,
    });
});
