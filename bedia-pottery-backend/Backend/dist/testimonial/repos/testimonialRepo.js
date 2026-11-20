"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestimonial = exports.updateTestimonialById = exports.deleteTestimonialById = exports.fetchTestimonialById = exports.fetchAllTestimonialsForAdmin = exports.fetchAllTestimonials = exports.getTestimonialsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const testimonialModel_1 = __importDefault(require("../models/testimonialModel"));
const getTestimonialsCount = async (query) => {
    return await testimonialModel_1.default.countDocuments(query);
};
exports.getTestimonialsCount = getTestimonialsCount;
const fetchAllTestimonials = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await testimonialModel_1.default
        .find(dbQuery)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllTestimonials = fetchAllTestimonials;
const fetchAllTestimonialsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await testimonialModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllTestimonialsForAdmin = fetchAllTestimonialsForAdmin;
const fetchTestimonialById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await testimonialModel_1.default
        .findOne(dbQuery)
        .select({ content: 1, author: 1, designation: 1, authorImage: 1, _id: 0 })
        .lean();
};
exports.fetchTestimonialById = fetchTestimonialById;
const deleteTestimonialById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await testimonialModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteTestimonialById = deleteTestimonialById;
const updateTestimonialById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await testimonialModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateTestimonialById = updateTestimonialById;
const createTestimonial = async (data) => {
    return await testimonialModel_1.default.create(data);
};
exports.createTestimonial = createTestimonial;
