"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = exports.updateServiceById = exports.deleteServiceById = exports.fetchServiceBySlug = exports.fetchServiceById = exports.fetchAllServicesForAdmin = exports.fetchAllServices = exports.getServicesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const getServicesCount = async (query) => {
    return await serviceModel_1.default.countDocuments(query);
};
exports.getServicesCount = getServicesCount;
const fetchAllServices = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await serviceModel_1.default
        .find(dbQuery)
        .populate({
        path: 'serviceTypeId',
        select: 'title -_id',
    })
        .select({
        keyAdvantages: 0,
        overview: 0,
        imageTitle: 0,
        imageDescription: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllServices = fetchAllServices;
const fetchAllServicesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await serviceModel_1.default
        .find(dbQuery)
        .populate({
        path: 'serviceTypeId',
        select: 'title -_id',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllServicesForAdmin = fetchAllServicesForAdmin;
const fetchServiceById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceModel_1.default
        .findOne(dbQuery)
        .populate({
        path: 'serviceTypeId',
        select: 'title',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchServiceById = fetchServiceById;
const fetchServiceBySlug = async (slug) => {
    const dbQuery = {
        slug: slug,
        isDeleted: false,
    };
    return await serviceModel_1.default
        .findOne(dbQuery)
        .populate({
        path: 'serviceTypeId',
        select: 'title',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchServiceBySlug = fetchServiceBySlug;
const deleteServiceById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteServiceById = deleteServiceById;
const updateServiceById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await serviceModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateServiceById = updateServiceById;
const createService = async (data) => {
    return await serviceModel_1.default.create(data);
};
exports.createService = createService;
