"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFaqByIdUseCase = exports.deleteFaqByIdUseCase = exports.updateFaqByIdUseCase = exports.createFaqUseCase = exports.getAllFaqsForAdminUseCase = exports.getFaqsByCategoryUseCase = exports.getAllFaqsUseCase = void 0;
const faqRepo_1 = require("../repos/faqRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllFaqsUseCase = async (queryParams) => {
    const { page = '1', search, category } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [
            { question: { $regex: search, $options: 'i' } },
            { answer: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    if (category && category.length > 0) {
        query.category = category;
    }
    const totalCount = await (0, faqRepo_1.getFaqsCount)(query);
    if (!totalCount)
        return { totalCount: 0, faqs: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const faqs = await (0, faqRepo_1.fetchAllFaqs)(query, skip, parseInt(limit));
    return { totalCount, faqs };
};
exports.getAllFaqsUseCase = getAllFaqsUseCase;
const getFaqsByCategoryUseCase = async (category) => {
    const faqs = await (0, faqRepo_1.fetchFaqsByCategory)(category);
    return { totalCount: faqs.length, faqs };
};
exports.getFaqsByCategoryUseCase = getFaqsByCategoryUseCase;
const getAllFaqsForAdminUseCase = async (queryParams) => {
    const { page = '1', search, category } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { question: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    if (category && category.length > 0) {
        query.category = category;
    }
    const totalCount = await (0, faqRepo_1.getFaqsCount)(query);
    if (!totalCount)
        return { totalCount: 0, faqs: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const faqs = await (0, faqRepo_1.fetchAllFaqsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, faqs };
};
exports.getAllFaqsForAdminUseCase = getAllFaqsForAdminUseCase;
const createFaqUseCase = async (data) => {
    // check for  unique value duplications
    const faq = await (0, faqRepo_1.createFaq)(data);
    if (!faq) {
        throw new appError_1.default('Couldn\'t Create new Faq. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createFaqUseCase = createFaqUseCase;
const updateFaqByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingFaq = await fetchFaqById(id);
        // check for  unique value updations
        const faq = await (0, faqRepo_1.updateFaqById)(id, data);
        if (!faq)
            throw new appError_1.default('Couldn\'t update Faq', httpStatus_1.HttpStatus.NOT_FOUND);
        return faq;
    }
    throw new appError_1.default('No Faq Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateFaqByIdUseCase = updateFaqByIdUseCase;
const deleteFaqByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const faq = await (0, faqRepo_1.deleteFaqById)(id);
        // check for  unique value updations
        if (faq)
            return true;
    }
    throw new appError_1.default('No Faq Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteFaqByIdUseCase = deleteFaqByIdUseCase;
const getFaqByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const faq = await (0, faqRepo_1.fetchFaqById)(query._id);
        if (faq)
            return faq;
    }
    throw new appError_1.default('No Faq Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getFaqByIdUseCase = getFaqByIdUseCase;
