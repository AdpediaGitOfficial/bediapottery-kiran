"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaq = exports.updateFaqById = exports.deleteFaqById = exports.fetchFaqById = exports.fetchFaqsByCategory = exports.fetchAllFaqsForAdmin = exports.fetchAllFaqs = exports.getFaqsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const faqModel_1 = __importDefault(require("../models/faqModel"));
const getFaqsCount = async (query) => {
    return await faqModel_1.default.countDocuments(query);
};
exports.getFaqsCount = getFaqsCount;
const fetchAllFaqs = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await faqModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllFaqs = fetchAllFaqs;
const fetchAllFaqsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await faqModel_1.default
        .find(dbQuery)
        .select({ _id: 1, question: 1, category: 1, answer: 1, isActive: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllFaqsForAdmin = fetchAllFaqsForAdmin;
const fetchFaqsByCategory = async (category) => {
    return await faqModel_1.default
        .find({ category, isActive: true, isDeleted: false })
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .lean();
};
exports.fetchFaqsByCategory = fetchFaqsByCategory;
const fetchFaqById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await faqModel_1.default.findOne(dbQuery).select({ _id: 0, isDeleted: 0, __v: 0 }).lean();
};
exports.fetchFaqById = fetchFaqById;
const deleteFaqById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await faqModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteFaqById = deleteFaqById;
const updateFaqById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await faqModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateFaqById = updateFaqById;
const createFaq = async (data) => {
    return await faqModel_1.default.create(data);
};
exports.createFaq = createFaq;
