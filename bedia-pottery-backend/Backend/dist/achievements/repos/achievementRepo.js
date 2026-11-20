"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAchievement = exports.updateAchievementById = exports.deleteAchievementById = exports.fetchAchievementById = exports.fetchAllAchievementsForAdmin = exports.fetchAllAchievements = exports.getAchievementsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const achievementModel_1 = __importDefault(require("../models/achievementModel"));
const getAchievementsCount = async (query) => {
    return await achievementModel_1.default.countDocuments(query);
};
exports.getAchievementsCount = getAchievementsCount;
const fetchAllAchievements = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await achievementModel_1.default
        .find(dbQuery)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAchievements = fetchAllAchievements;
const fetchAllAchievementsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await achievementModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAchievementsForAdmin = fetchAllAchievementsForAdmin;
const fetchAchievementById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await achievementModel_1.default
        .findOne(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchAchievementById = fetchAchievementById;
const deleteAchievementById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await achievementModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteAchievementById = deleteAchievementById;
const updateAchievementById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await achievementModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateAchievementById = updateAchievementById;
const createAchievement = async (data) => {
    return await achievementModel_1.default.create(data);
};
exports.createAchievement = createAchievement;
