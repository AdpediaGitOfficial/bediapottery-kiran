"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCareerFooter = exports.updateCareerFooterById = exports.deleteCareerFooterById = exports.fetchCareerFooterById = exports.fetchAllCareerFootersForAdmin = exports.fetchAllCareerFooters = exports.getCareerFootersCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const careerFooterModel_1 = __importDefault(require("../models/careerFooterModel"));
const getCareerFootersCount = async (query) => {
    return await careerFooterModel_1.default.countDocuments(query);
};
exports.getCareerFootersCount = getCareerFootersCount;
const fetchAllCareerFooters = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await careerFooterModel_1.default
        .find(dbQuery)
        .select({ title: 1, content: 1, image: 1, _id: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllCareerFooters = fetchAllCareerFooters;
const fetchAllCareerFootersForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await careerFooterModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllCareerFootersForAdmin = fetchAllCareerFootersForAdmin;
const fetchCareerFooterById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerFooterModel_1.default
        .findOne(dbQuery)
        .select({ title: 1, content: 1, image: 1, _id: 0 })
        .lean();
};
exports.fetchCareerFooterById = fetchCareerFooterById;
const deleteCareerFooterById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerFooterModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteCareerFooterById = deleteCareerFooterById;
const updateCareerFooterById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await careerFooterModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateCareerFooterById = updateCareerFooterById;
const createCareerFooter = async (data) => {
    return await careerFooterModel_1.default.create(data);
};
exports.createCareerFooter = createCareerFooter;
