"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpeningHours = exports.updateOpeningHoursById = exports.deleteOpeningHoursById = exports.fetchOpeningHoursBySlug = exports.fetchOpeningHoursById = exports.fetchAllOpeningHoursForAdmin = exports.fetchAllOpeningHours = exports.getOpeningHoursCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const openingHoursModel_1 = __importDefault(require("../models/openingHoursModel"));
const getOpeningHoursCount = async (query) => {
    return await openingHoursModel_1.default.countDocuments(query);
};
exports.getOpeningHoursCount = getOpeningHoursCount;
const fetchAllOpeningHours = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
        isActive: true,
    };
    return await openingHoursModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
exports.fetchAllOpeningHours = fetchAllOpeningHours;
const fetchAllOpeningHoursForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await openingHoursModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllOpeningHoursForAdmin = fetchAllOpeningHoursForAdmin;
const fetchOpeningHoursById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await openingHoursModel_1.default
        .findOne(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchOpeningHoursById = fetchOpeningHoursById;
const fetchOpeningHoursBySlug = async (slug) => {
    const dbQuery = {
        slug: slug,
        isDeleted: false,
        isActive: true,
    };
    return await openingHoursModel_1.default
        .findOne(dbQuery)
        .select({
        isDeleted: 0,
        isActive: 0,
        updatedAt: 0,
        __v: 0,
        createdAt: 0,
        showOnHomepage: 0,
    })
        .lean();
};
exports.fetchOpeningHoursBySlug = fetchOpeningHoursBySlug;
const deleteOpeningHoursById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await openingHoursModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteOpeningHoursById = deleteOpeningHoursById;
const updateOpeningHoursById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await openingHoursModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateOpeningHoursById = updateOpeningHoursById;
const createOpeningHours = async (data) => {
    return await openingHoursModel_1.default.create(data);
};
exports.createOpeningHours = createOpeningHours;
