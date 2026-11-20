"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPageMeta = exports.updatePageMetaById = exports.deletePageMetaById = exports.fetchPageMetaByUrl = exports.fetchPageMetaById = exports.fetchAllPageMetasForAdmin = exports.getPageMetasCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const pageMetaModel_1 = __importDefault(require("../models/pageMetaModel"));
const getPageMetasCount = async (query) => {
    return await pageMetaModel_1.default.countDocuments(query);
};
exports.getPageMetasCount = getPageMetasCount;
const fetchAllPageMetasForAdmin = async (query, skip, limit) => {
    return await pageMetaModel_1.default
        .find(query)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllPageMetasForAdmin = fetchAllPageMetasForAdmin;
const fetchPageMetaById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await pageMetaModel_1.default
        .findOne(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchPageMetaById = fetchPageMetaById;
const fetchPageMetaByUrl = async (query) => {
    return await pageMetaModel_1.default
        .findOne(query)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchPageMetaByUrl = fetchPageMetaByUrl;
const deletePageMetaById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await pageMetaModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deletePageMetaById = deletePageMetaById;
const updatePageMetaById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await pageMetaModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updatePageMetaById = updatePageMetaById;
const createPageMeta = async (data) => {
    return await pageMetaModel_1.default.create(data);
};
exports.createPageMeta = createPageMeta;
