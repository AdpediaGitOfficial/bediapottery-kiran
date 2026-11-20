"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardCounts = exports.getServiceBySlug = exports.getServiceById = exports.deleteServiceById = exports.updateServiceById = exports.createService = exports.getAllServicesForAdmin = exports.getAllServices = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const serviceUseCase_1 = require("../useCases/serviceUseCase");
exports.getAllServices = (0, express_async_handler_1.default)(async (req, res) => {
    const services = await (0, serviceUseCase_1.getAllServicesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Services successfully',
        result: services,
    });
});
exports.getAllServicesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const services = await (0, serviceUseCase_1.getAllServicesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Services successfully',
        result: services,
    });
});
exports.createService = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, serviceUseCase_1.createServiceUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Service successfully',
        result: true,
    });
});
exports.updateServiceById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, serviceUseCase_1.updateServiceByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Service successfully',
        result: true,
    });
});
exports.deleteServiceById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, serviceUseCase_1.deleteServiceByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Service successfully',
        result: true,
    });
});
exports.getServiceById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const service = await (0, serviceUseCase_1.getServiceByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Service successfully',
        result: service,
    });
});
exports.getServiceBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const service = await (0, serviceUseCase_1.getServiceBySlugUseCase)({ slug: slug });
    res.status(200).json({
        success: true,
        message: 'Fetched Service successfully',
        result: service,
    });
});
exports.getDashboardCounts = (0, express_async_handler_1.default)(async (req, res) => {
    const counts = await (0, serviceUseCase_1.getDashboardCountsUseCase)();
    res.status(200).json({
        success: true,
        message: 'Fetched dashboard counts successfully',
        result: counts,
    });
});
