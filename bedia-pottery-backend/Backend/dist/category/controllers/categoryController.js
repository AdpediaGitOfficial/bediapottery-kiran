"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.deleteCategoryById = exports.updateCategoryById = exports.createCategory = exports.getAllCategoriesForAdmin = exports.getAllCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const categoryUseCase_1 = require("../useCases/categoryUseCase");
exports.getAllCategories = (0, express_async_handler_1.default)(async (req, res) => {
    const categories = await (0, categoryUseCase_1.getAllCategoriesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Categories successfully',
        result: categories,
    });
});
exports.getAllCategoriesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const categories = await (0, categoryUseCase_1.getAllCategoriesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Categories successfully',
        result: categories,
    });
});
exports.createCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, categoryUseCase_1.createCategoryUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Category successfully',
        result: true,
    });
});
exports.updateCategoryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, categoryUseCase_1.updateCategoryByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Category successfully',
        result: true,
    });
});
exports.deleteCategoryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, categoryUseCase_1.deleteCategoryByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Category successfully',
        result: true,
    });
});
exports.getCategoryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const category = await (0, categoryUseCase_1.getCategoryByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Category successfully',
        result: category,
    });
});
