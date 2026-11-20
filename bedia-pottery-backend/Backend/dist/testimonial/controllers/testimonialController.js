"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonialById = exports.deleteTestimonialById = exports.updateTestimonialById = exports.createTestimonial = exports.getAllTestimonialsForAdmin = exports.getAllTestimonials = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const testimonialUseCase_1 = require("../useCases/testimonialUseCase");
exports.getAllTestimonials = (0, express_async_handler_1.default)(async (req, res) => {
    const testimonials = await (0, testimonialUseCase_1.getAllTestimonialsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Testimonials successfully',
        result: testimonials,
    });
});
exports.getAllTestimonialsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const testimonials = await (0, testimonialUseCase_1.getAllTestimonialsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Testimonials successfully',
        result: testimonials,
    });
});
exports.createTestimonial = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, testimonialUseCase_1.createTestimonialUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Testimonial successfully',
        result: true,
    });
});
exports.updateTestimonialById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, testimonialUseCase_1.updateTestimonialByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Testimonial successfully',
        result: true,
    });
});
exports.deleteTestimonialById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, testimonialUseCase_1.deleteTestimonialByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Testimonial successfully',
        result: true,
    });
});
exports.getTestimonialById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const testimonial = await (0, testimonialUseCase_1.getTestimonialByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Testimonial successfully',
        result: testimonial,
    });
});
