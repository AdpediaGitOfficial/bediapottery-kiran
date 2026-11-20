"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareerMetaBySlug = exports.getCareerBySlug = exports.getCareerById = exports.deleteCareerById = exports.updateCareerById = exports.createJobApplication = exports.createCareer = exports.getAllJobApplications = exports.getAllCareersForAdmin = exports.getAllCareers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const careerUseCase_1 = require("../useCases/careerUseCase");
exports.getAllCareers = (0, express_async_handler_1.default)(async (req, res) => {
    const careers = await (0, careerUseCase_1.getAllCareersUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Careers successfully',
        result: careers,
    });
});
exports.getAllCareersForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const careers = await (0, careerUseCase_1.getAllCareersForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Careers successfully',
        result: careers,
    });
});
exports.getAllJobApplications = (0, express_async_handler_1.default)(async (req, res) => {
    const jobApplications = await (0, careerUseCase_1.getAllJobApplicationsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Job Applications successfully',
        result: jobApplications,
    });
});
exports.createCareer = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, careerUseCase_1.createCareerUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Career successfully',
        result: true,
    });
});
exports.createJobApplication = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.file) {
        res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
        return;
    }
    const data = req.body;
    await (0, careerUseCase_1.createJobApplicationUseCase)(data, req.file);
    res.status(200).json({
        success: true,
        message: 'Added Job Application successfully',
        result: true,
    });
});
exports.updateCareerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, careerUseCase_1.updateCareerByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Career successfully',
        result: true,
    });
});
exports.deleteCareerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, careerUseCase_1.deleteCareerByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Career successfully',
        result: true,
    });
});
exports.getCareerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const career = await (0, careerUseCase_1.getCareerByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Career successfully',
        result: career,
    });
});
exports.getCareerBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const career = await (0, careerUseCase_1.getCareerBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched Career successfully',
        result: career,
    });
});
exports.getCareerMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const career = await (0, careerUseCase_1.getCareerMetaBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: career,
    });
});
