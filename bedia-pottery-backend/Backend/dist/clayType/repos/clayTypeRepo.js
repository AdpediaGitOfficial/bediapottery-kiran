"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClayType = exports.updateClayTypeById = exports.deleteClayTypeById = exports.fetchClayTypeById = exports.fetchAllClayTypesForAdmin = exports.fetchAllClayTypes = exports.getClayTypesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const clayTypeModel_1 = __importDefault(require("../models/clayTypeModel"));
const getClayTypesCount = async (query) => {
    return await clayTypeModel_1.default.countDocuments(query);
};
exports.getClayTypesCount = getClayTypesCount;
const fetchAllClayTypes = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
        isActive: true,
    };
    return await clayTypeModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
exports.fetchAllClayTypes = fetchAllClayTypes;
const fetchAllClayTypesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await clayTypeModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllClayTypesForAdmin = fetchAllClayTypesForAdmin;
const fetchClayTypeById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await clayTypeModel_1.default
        .findOne(dbQuery)
        .populate('parentId', 'title')
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchClayTypeById = fetchClayTypeById;
const deleteClayTypeById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await clayTypeModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteClayTypeById = deleteClayTypeById;
const updateClayTypeById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await clayTypeModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateClayTypeById = updateClayTypeById;
const createClayType = async (data) => {
    return await clayTypeModel_1.default.create(data);
};
exports.createClayType = createClayType;
