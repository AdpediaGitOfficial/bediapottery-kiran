"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGallery = exports.updateGalleryById = exports.deleteGalleryById = exports.fetchGalleryById = exports.fetchAllGalleriesForAdmin = exports.fetchAllGalleries = exports.getGalleriesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const galleryModel_1 = __importDefault(require("../models/galleryModel"));
const getGalleriesCount = async (query) => {
    return await galleryModel_1.default.countDocuments(query);
};
exports.getGalleriesCount = getGalleriesCount;
const fetchAllGalleries = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await galleryModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllGalleries = fetchAllGalleries;
const fetchAllGalleriesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await galleryModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllGalleriesForAdmin = fetchAllGalleriesForAdmin;
const fetchGalleryById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await galleryModel_1.default.findOne(dbQuery).select({ isDeleted: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchGalleryById = fetchGalleryById;
const deleteGalleryById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await galleryModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteGalleryById = deleteGalleryById;
const updateGalleryById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await galleryModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateGalleryById = updateGalleryById;
const createGallery = async (data) => {
    return await galleryModel_1.default.create(data);
};
exports.createGallery = createGallery;
