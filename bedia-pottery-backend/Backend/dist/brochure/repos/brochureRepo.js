"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrochure = exports.updateBrochureById = exports.deleteBrochureById = exports.fetchBrochureById = exports.fetchAllBrochuresForAdmin = exports.fetchAllBrochures = exports.getBrochuresCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const brochureModel_1 = __importDefault(require("../models/brochureModel"));
const getBrochuresCount = async (query) => {
    return await brochureModel_1.default.countDocuments(query);
};
exports.getBrochuresCount = getBrochuresCount;
const fetchAllBrochures = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await brochureModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllBrochures = fetchAllBrochures;
const fetchAllBrochuresForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await brochureModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllBrochuresForAdmin = fetchAllBrochuresForAdmin;
const fetchBrochureById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await brochureModel_1.default.findOne(dbQuery).select({ isDeleted: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchBrochureById = fetchBrochureById;
const deleteBrochureById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await brochureModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteBrochureById = deleteBrochureById;
const updateBrochureById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await brochureModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateBrochureById = updateBrochureById;
const createBrochure = async (data) => {
    return await brochureModel_1.default.create(data);
};
exports.createBrochure = createBrochure;
