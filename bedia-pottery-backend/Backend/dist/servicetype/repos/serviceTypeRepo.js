"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceType = exports.updateServiceTypeById = exports.deleteServiceTypeById = exports.fetchServiceTypeById = exports.fetchAllServiceTypesForAdmin = exports.fetchAllServiceTypes = exports.getServiceTypesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const serviceTypeModel_1 = __importDefault(require("../models/serviceTypeModel"));
const getServiceTypesCount = async (query) => {
    return await serviceTypeModel_1.default.countDocuments(query);
};
exports.getServiceTypesCount = getServiceTypesCount;
const fetchAllServiceTypes = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await serviceTypeModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllServiceTypes = fetchAllServiceTypes;
const fetchAllServiceTypesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await serviceTypeModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllServiceTypesForAdmin = fetchAllServiceTypesForAdmin;
const fetchServiceTypeById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceTypeModel_1.default
        .findOne(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchServiceTypeById = fetchServiceTypeById;
const deleteServiceTypeById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceTypeModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteServiceTypeById = deleteServiceTypeById;
const updateServiceTypeById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceTypeModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateServiceTypeById = updateServiceTypeById;
const createServiceType = async (data) => {
    return await serviceTypeModel_1.default.create(data);
};
exports.createServiceType = createServiceType;
