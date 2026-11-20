"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTypeById = exports.deleteServiceTypeById = exports.updateServiceTypeById = exports.createServiceType = exports.getAllServiceTypesForAdmin = exports.getAllServiceTypes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const serviceTypeUseCase_1 = require("../useCases/serviceTypeUseCase");
exports.getAllServiceTypes = (0, express_async_handler_1.default)(async (req, res) => {
    const serviceTypes = await (0, serviceTypeUseCase_1.getAllServiceTypesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All ServiceTypes successfully',
        result: serviceTypes,
    });
});
exports.getAllServiceTypesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const serviceTypes = await (0, serviceTypeUseCase_1.getAllServiceTypesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All ServiceTypes successfully',
        result: serviceTypes,
    });
});
exports.createServiceType = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, serviceTypeUseCase_1.createServiceTypeUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created ServiceType successfully',
        result: true,
    });
});
exports.updateServiceTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, serviceTypeUseCase_1.updateServiceTypeByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated ServiceType successfully',
        result: true,
    });
});
exports.deleteServiceTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, serviceTypeUseCase_1.deleteServiceTypeByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted ServiceType successfully',
        result: true,
    });
});
exports.getServiceTypeById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const serviceType = await (0, serviceTypeUseCase_1.getServiceTypeByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched ServiceType successfully',
        result: serviceType,
    });
});
