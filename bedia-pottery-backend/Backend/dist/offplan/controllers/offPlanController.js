"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeaturedOffPlan = exports.getOffPlanMetaBySlug = exports.getOffPlanBySlug = exports.getOffPlanById = exports.deleteOffPlanById = exports.updateOffPlanById = exports.createOffPlan = exports.getAllExclusiveOffPlans = exports.getKeywordsList = exports.getOffPlansByFilter = exports.getAllOffPlansForAdmin = exports.getAllOffPlans = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const OffPlanUseCase_1 = require("../useCases/OffPlanUseCase");
exports.getAllOffPlans = (0, express_async_handler_1.default)(async (req, res) => {
    const offPlans = await (0, OffPlanUseCase_1.getAllOffPlansUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All offPlans successfully',
        result: offPlans,
    });
});
exports.getAllOffPlansForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const offPlans = await (0, OffPlanUseCase_1.getAllOffPlansForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All offPlans successfully',
        result: offPlans,
    });
});
exports.getOffPlansByFilter = (0, express_async_handler_1.default)(async (req, res) => {
    const offPlans = await (0, OffPlanUseCase_1.getOffPlansByFilterUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Fetched All offPlans successfully',
        result: offPlans,
    });
});
exports.getKeywordsList = (0, express_async_handler_1.default)(async (req, res) => {
    const keywords = await (0, OffPlanUseCase_1.getKeywordsListUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched keywords successfully',
        result: keywords,
    });
});
exports.getAllExclusiveOffPlans = (0, express_async_handler_1.default)(async (req, res) => {
    const offPlans = await (0, OffPlanUseCase_1.getAllExclusiveOffPlansUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched Exclusive offPlans successfully',
        result: offPlans,
    });
});
exports.createOffPlan = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, OffPlanUseCase_1.createOffPlanUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created offplan successfully',
        result: true,
    });
});
exports.updateOffPlanById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, OffPlanUseCase_1.updateOffPlanByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated offplan successfully',
        result: true,
    });
});
exports.deleteOffPlanById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, OffPlanUseCase_1.deleteOffPlanByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted offplan successfully',
        result: true,
    });
});
exports.getOffPlanById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const offPlan = await (0, OffPlanUseCase_1.getOffPlanByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched offPlan successfully',
        result: offPlan,
    });
});
exports.getOffPlanBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const offPlan = await (0, OffPlanUseCase_1.getOffPlanBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched offPlan successfully',
        result: offPlan,
    });
});
exports.getOffPlanMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const offPlan = await (0, OffPlanUseCase_1.getOffPlanMetaBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched offPlan successfully',
        result: offPlan,
    });
});
exports.updateFeaturedOffPlan = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, OffPlanUseCase_1.updateFeaturedOffPlanUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Updated Featured Property successfully',
        result: true,
    });
});
