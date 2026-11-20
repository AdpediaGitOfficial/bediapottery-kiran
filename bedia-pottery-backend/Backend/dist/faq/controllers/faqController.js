"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFaqById = exports.deleteFaqById = exports.updateFaqById = exports.createFaq = exports.getFaqsByCategory = exports.getAllFaqsForAdmin = exports.getAllFaqs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const faqUseCase_1 = require("../useCases/faqUseCase");
exports.getAllFaqs = (0, express_async_handler_1.default)(async (req, res) => {
    const faqs = await (0, faqUseCase_1.getAllFaqsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Faqs successfully',
        result: faqs,
    });
});
exports.getAllFaqsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const faqs = await (0, faqUseCase_1.getAllFaqsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Faqs successfully',
        result: faqs,
    });
});
exports.getFaqsByCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { category } = req.params;
    const faqs = await (0, faqUseCase_1.getFaqsByCategoryUseCase)(category);
    res.status(200).json({
        success: true,
        message: 'Fetched Faqs by category successfully',
        result: faqs,
    });
});
exports.createFaq = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, faqUseCase_1.createFaqUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Faq successfully',
        result: true,
    });
});
exports.updateFaqById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, faqUseCase_1.updateFaqByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Faq successfully',
        result: true,
    });
});
exports.deleteFaqById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, faqUseCase_1.deleteFaqByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Faq successfully',
        result: true,
    });
});
exports.getFaqById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const faq = await (0, faqUseCase_1.getFaqByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Faq successfully',
        result: faq,
    });
});
