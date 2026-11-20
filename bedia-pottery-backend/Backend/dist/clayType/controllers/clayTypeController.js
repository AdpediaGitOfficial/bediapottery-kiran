"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClayTypeById = exports.deleteClayTypeById = exports.updateClayTypeById = exports.createClayType = exports.getAllClayTypesForAdmin = exports.getAllClayTypes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const clayTypeUseCase_1 = require("../useCases/clayTypeUseCase");
exports.getAllClayTypes = (0, express_async_handler_1.default)(async (req, res) => {
    const clayTypes = await (0, clayTypeUseCase_1.getAllClayTypesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All ClayTypes successfully',
        result: clayTypes,
    });
});
exports.getAllClayTypesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const clayTypes = await (0, clayTypeUseCase_1.getAllClayTypesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All ClayTypes successfully',
        result: clayTypes,
    });
});
exports.createClayType = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, clayTypeUseCase_1.createClayTypeUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created ClayType successfully',
        result: true,
    });
});
exports.updateClayTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, clayTypeUseCase_1.updateClayTypeByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated ClayType successfully',
        result: true,
    });
});
exports.deleteClayTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, clayTypeUseCase_1.deleteClayTypeByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted ClayType successfully',
        result: true,
    });
});
exports.getClayTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const clayType = await (0, clayTypeUseCase_1.getClayTypeByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched ClayType successfully',
        result: clayType,
    });
});
