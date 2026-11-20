"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonialByIdUseCase = exports.deleteTestimonialByIdUseCase = exports.updateTestimonialByIdUseCase = exports.createTestimonialUseCase = exports.getAllTestimonialsForAdminUseCase = exports.getAllTestimonialsUseCase = void 0;
const testimonialRepo_1 = require("../repos/testimonialRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllTestimonialsUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { author: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { designation: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, testimonialRepo_1.getTestimonialsCount)(query);
    if (!totalCount)
        return { totalCount: 0, testimonials: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const testimonials = await (0, testimonialRepo_1.fetchAllTestimonials)(query, skip, parseInt(limit));
    return { totalCount, testimonials };
};
exports.getAllTestimonialsUseCase = getAllTestimonialsUseCase;
const getAllTestimonialsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { author: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { designation: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, testimonialRepo_1.getTestimonialsCount)(query);
    if (!totalCount)
        return { totalCount: 0, testimonials: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const testimonials = await (0, testimonialRepo_1.fetchAllTestimonialsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, testimonials };
};
exports.getAllTestimonialsForAdminUseCase = getAllTestimonialsForAdminUseCase;
const createTestimonialUseCase = async (data) => {
    // check for  unique value duplications
    const testimonial = await (0, testimonialRepo_1.createTestimonial)(data);
    if (!testimonial) {
        throw new appError_1.default('Couldn\'t Create new Testimonial. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createTestimonialUseCase = createTestimonialUseCase;
const updateTestimonialByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingTestimonial = await fetchTestimonialById(id);
        // check for  unique value updations
        const testimonial = await (0, testimonialRepo_1.updateTestimonialById)(id, data);
        if (!testimonial)
            throw new appError_1.default('Couldn\'t update Testimonial', httpStatus_1.HttpStatus.NOT_FOUND);
        return testimonial;
    }
    throw new appError_1.default('No Testimonial Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateTestimonialByIdUseCase = updateTestimonialByIdUseCase;
const deleteTestimonialByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const testimonial = await (0, testimonialRepo_1.deleteTestimonialById)(id);
        // check for  unique value updations
        if (testimonial)
            return true;
    }
    throw new appError_1.default('No Testimonial Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteTestimonialByIdUseCase = deleteTestimonialByIdUseCase;
const getTestimonialByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const testimonial = await (0, testimonialRepo_1.fetchTestimonialById)(query._id);
        if (testimonial)
            return testimonial;
    }
    throw new appError_1.default('No Testimonial Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getTestimonialByIdUseCase = getTestimonialByIdUseCase;
