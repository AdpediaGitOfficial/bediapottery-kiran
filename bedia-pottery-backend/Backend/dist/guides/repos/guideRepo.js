"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuide = exports.checkGuideExists = exports.updateGuideById = exports.deleteGuideById = exports.fetchGuideById = exports.fetchAllGuidesForAdmin = exports.fetchSingleGuide = exports.getGuidesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const guideModel_1 = __importDefault(require("../models/guideModel"));
const getGuidesCount = async (query) => {
    return await guideModel_1.default.countDocuments(query);
};
exports.getGuidesCount = getGuidesCount;
const fetchSingleGuide = async (query) => {
    return await guideModel_1.default
        .findOne(query)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchSingleGuide = fetchSingleGuide;
const fetchAllGuidesForAdmin = async (query) => {
    return await guideModel_1.default.find(query).select({ isDeleted: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchAllGuidesForAdmin = fetchAllGuidesForAdmin;
const fetchGuideById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await guideModel_1.default.findOne(dbQuery).select({ isDeleted: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchGuideById = fetchGuideById;
const deleteGuideById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await guideModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteGuideById = deleteGuideById;
const updateGuideById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await guideModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateGuideById = updateGuideById;
const checkGuideExists = async (query) => {
    return await guideModel_1.default.findOne(query).select({ _id: 1 }).lean();
};
exports.checkGuideExists = checkGuideExists;
const createGuide = async (data) => {
    return await guideModel_1.default.create(data);
};
exports.createGuide = createGuide;
