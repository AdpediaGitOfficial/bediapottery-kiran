"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareerFooterById = exports.deleteCareerFooterById = exports.updateCareerFooterById = exports.createCareerFooter = exports.getAllCareerFootersForAdmin = exports.getAllCareerFooters = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const careerFooterUseCase_1 = require("../useCases/careerFooterUseCase");
exports.getAllCareerFooters = (0, express_async_handler_1.default)(async (req, res) => {
    const careerFooters = await (0, careerFooterUseCase_1.getAllCareerFootersUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All CareerFooters successfully',
        result: careerFooters,
    });
});
exports.getAllCareerFootersForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const careerFooters = await (0, careerFooterUseCase_1.getAllCareerFootersForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All CareerFooters successfully',
        result: careerFooters,
    });
});
exports.createCareerFooter = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, careerFooterUseCase_1.createCareerFooterUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created CareerFooter successfully',
        result: true,
    });
});
exports.updateCareerFooterById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, careerFooterUseCase_1.updateCareerFooterByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated CareerFooter successfully',
        result: true,
    });
});
exports.deleteCareerFooterById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, careerFooterUseCase_1.deleteCareerFooterByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted CareerFooter successfully',
        result: true,
    });
});
exports.getCareerFooterById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const careerFooter = await (0, careerFooterUseCase_1.getCareerFooterByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched CareerFooter successfully',
        result: careerFooter,
    });
});
