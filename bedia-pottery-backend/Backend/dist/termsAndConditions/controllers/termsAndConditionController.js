"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTermsAndConditionMetaBySlug = exports.getTermsAndConditionBySlug = exports.getTermsAndConditionById = exports.deleteTermsAndConditionById = exports.updateTermsAndConditionById = exports.fetchFromXml = exports.createTermsAndCondition = exports.getAllTermsAndConditionsForAdmin = exports.getAllTermsAndConditions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const termsAndConditionUseCase_1 = require("../useCases/termsAndConditionUseCase");
exports.getAllTermsAndConditions = (0, express_async_handler_1.default)(async (req, res) => {
    const termsAndConditions = await (0, termsAndConditionUseCase_1.getAllTermsAndConditionsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All TermsAndConditions successfully',
        result: termsAndConditions,
    });
});
exports.getAllTermsAndConditionsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const termsAndConditions = await (0, termsAndConditionUseCase_1.getAllTermsAndConditionsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All TermsAndConditions successfully',
        result: termsAndConditions,
    });
});
exports.createTermsAndCondition = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, termsAndConditionUseCase_1.createTermsAndConditionUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created TermsAndCondition successfully',
        result: true,
    });
});
exports.fetchFromXml = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
        return;
    }
    const data = await (0, termsAndConditionUseCase_1.fetchTermsAndConditionFromXmlUseCase)(req.files);
    res.status(200).json({
        success: true,
        message: 'Fetched TermsAndConditions successfully',
        result: data,
    });
});
exports.updateTermsAndConditionById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, termsAndConditionUseCase_1.updateTermsAndConditionByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated TermsAndCondition successfully',
        result: true,
    });
});
exports.deleteTermsAndConditionById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, termsAndConditionUseCase_1.deleteTermsAndConditionByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted TermsAndCondition successfully',
        result: true,
    });
});
exports.getTermsAndConditionById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const termsAndCondition = await (0, termsAndConditionUseCase_1.getTermsAndConditionByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched TermsAndCondition successfully',
        result: termsAndCondition,
    });
});
exports.getTermsAndConditionBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const termsAndCondition = await (0, termsAndConditionUseCase_1.getTermsAndConditionBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched TermsAndCondition successfully',
        result: termsAndCondition,
    });
});
exports.getTermsAndConditionMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const termsAndCondition = await (0, termsAndConditionUseCase_1.getTermsAndConditionMetaBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: termsAndCondition,
    });
});
