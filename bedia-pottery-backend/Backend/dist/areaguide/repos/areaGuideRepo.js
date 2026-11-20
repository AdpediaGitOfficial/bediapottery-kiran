"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAreaGuide = exports.updateAreaGuideById = exports.deleteAreaGuideById = exports.fetchAreaGuideById = exports.fetchAreaGuideByName = exports.fetchAreaGuideMetaBySlug = exports.fetchAreaGuideBySlug = exports.fetchAllAreaGuidesForAdmin = exports.fetchAllAreaGuides = exports.getAreaGuidesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const areaGuideModel_1 = __importDefault(require("../models/areaGuideModel"));
const getAreaGuidesCount = async (query) => {
    return await areaGuideModel_1.default.countDocuments(query);
};
exports.getAreaGuidesCount = getAreaGuidesCount;
const fetchAllAreaGuides = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .find(dbQuery)
        .select({ name: 1, image: 1, slug: 1 })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAreaGuides = fetchAllAreaGuides;
const fetchAllAreaGuidesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .find(dbQuery)
        .select({ _id: 1, name: 1, image: 1, slug: 1 })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAreaGuidesForAdmin = fetchAllAreaGuidesForAdmin;
const fetchAreaGuideBySlug = async (slug) => {
    const dbQuery = {
        slug,
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, isDeleted: 0, 'faq._id': 0 })
        .lean();
};
exports.fetchAreaGuideBySlug = fetchAreaGuideBySlug;
const fetchAreaGuideMetaBySlug = async (slug) => {
    const dbQuery = {
        slug,
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, name: 1, image: 1, description: 1 })
        .lean();
};
exports.fetchAreaGuideMetaBySlug = fetchAreaGuideMetaBySlug;
const fetchAreaGuideByName = async (name) => {
    const dbQuery = {
        name,
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, isDeleted: 0, 'faq._id': 0 })
        .lean();
};
exports.fetchAreaGuideByName = fetchAreaGuideByName;
const fetchAreaGuideById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await areaGuideModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, slug: 0, createdAt: 0, updatedAt: 0, __v: 0, isDeleted: 0, 'faq._id': 0 })
        .lean();
};
exports.fetchAreaGuideById = fetchAreaGuideById;
const deleteAreaGuideById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await areaGuideModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteAreaGuideById = deleteAreaGuideById;
const updateAreaGuideById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await areaGuideModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateAreaGuideById = updateAreaGuideById;
const createAreaGuide = async (data) => {
    return await areaGuideModel_1.default.create(data);
};
exports.createAreaGuide = createAreaGuide;
