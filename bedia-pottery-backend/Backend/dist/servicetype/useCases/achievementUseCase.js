"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAchievementByIdUseCase = exports.deleteAchievementByIdUseCase = exports.updateAchievementByIdUseCase = exports.createAchievementUseCase = exports.getAllAchievementsForAdminUseCase = exports.getAllAchievementsUseCase = void 0;
const achievementRepo_1 = require("../repos/achievementRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllAchievementsUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, achievementRepo_1.getAchievementsCount)(query);
    if (!totalCount)
        return { totalCount: 0, achievements: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const achievements = await (0, achievementRepo_1.fetchAllAchievements)(query, skip, parseInt(limit));
    return { totalCount, achievements };
};
exports.getAllAchievementsUseCase = getAllAchievementsUseCase;
const getAllAchievementsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, achievementRepo_1.getAchievementsCount)(query);
    if (!totalCount)
        return { totalCount: 0, achievements: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const achievements = await (0, achievementRepo_1.fetchAllAchievementsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, achievements };
};
exports.getAllAchievementsForAdminUseCase = getAllAchievementsForAdminUseCase;
const createAchievementUseCase = async (data) => {
    // check for  unique value duplications
    const achievement = await (0, achievementRepo_1.createAchievement)(data);
    if (!achievement) {
        throw new appError_1.default('Couldn\'t Create new Achievement. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createAchievementUseCase = createAchievementUseCase;
const updateAchievementByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingAchievement = await fetchAchievementById(id);
        // check for  unique value updations
        const achievement = await (0, achievementRepo_1.updateAchievementById)(id, data);
        if (!achievement)
            throw new appError_1.default('Couldn\'t update Achievement', httpStatus_1.HttpStatus.NOT_FOUND);
        return achievement;
    }
    throw new appError_1.default('No Achievement Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateAchievementByIdUseCase = updateAchievementByIdUseCase;
const deleteAchievementByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const achievement = await (0, achievementRepo_1.deleteAchievementById)(id);
        // check for  unique value updations
        if (achievement)
            return true;
    }
    throw new appError_1.default('No Achievement Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteAchievementByIdUseCase = deleteAchievementByIdUseCase;
const getAchievementByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const achievement = await (0, achievementRepo_1.fetchAchievementById)(query._id);
        if (achievement)
            return achievement;
    }
    throw new appError_1.default('No Achievement Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAchievementByIdUseCase = getAchievementByIdUseCase;
