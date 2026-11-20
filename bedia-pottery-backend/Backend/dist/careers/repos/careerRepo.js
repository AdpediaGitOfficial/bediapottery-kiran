"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCareer = exports.updateCareerById = exports.deleteCareerById = exports.fetchCareerMetaBySlug = exports.fetchCareerBySlug = exports.fetchCareerById = exports.fetchAllCareersForAdmin = exports.fetchAllCareers = exports.getCareersCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const careerModel_1 = __importDefault(require("../models/careerModel"));
const getCareersCount = async (query) => {
    return await careerModel_1.default.countDocuments(query);
};
exports.getCareersCount = getCareersCount;
const fetchAllCareers = async (query, skip, limit) => {
    return await careerModel_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};
exports.fetchAllCareers = fetchAllCareers;
const fetchAllCareersForAdmin = async (query, skip, limit) => {
    return await careerModel_1.default
        .find(query)
        .select({
        isDeleted: 0,
        responsibilities: 0,
        requirements: 0,
        updatedAt: 0,
        __v: 0,
    })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllCareersForAdmin = fetchAllCareersForAdmin;
const fetchCareerById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, slug: 0, __v: 0 })
        .lean();
};
exports.fetchCareerById = fetchCareerById;
const fetchCareerBySlug = async (query) => {
    return await careerModel_1.default
        .findOne(query)
        .select({ _id: 0, isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchCareerBySlug = fetchCareerBySlug;
const fetchCareerMetaBySlug = async (query) => {
    return await careerModel_1.default.findOne(query).select({ _id: 0, title: 1, description: 1 }).lean();
};
exports.fetchCareerMetaBySlug = fetchCareerMetaBySlug;
const deleteCareerById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteCareerById = deleteCareerById;
const updateCareerById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateCareerById = updateCareerById;
const createCareer = async (data) => {
    return await careerModel_1.default.create(data);
};
exports.createCareer = createCareer;
