"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAchievementById = exports.deleteAchievementById = exports.updateAchievementById = exports.createAchievement = exports.getAllAchievementsForAdmin = exports.getAllAchievements = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const achievementUseCase_1 = require("../useCases/achievementUseCase");
exports.getAllAchievements = (0, express_async_handler_1.default)(async (req, res) => {
    const achievements = await (0, achievementUseCase_1.getAllAchievementsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Achievements successfully',
        result: achievements,
    });
});
exports.getAllAchievementsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const achievements = await (0, achievementUseCase_1.getAllAchievementsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Achievements successfully',
        result: achievements,
    });
});
exports.createAchievement = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, achievementUseCase_1.createAchievementUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Achievement successfully',
        result: true,
    });
});
exports.updateAchievementById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, achievementUseCase_1.updateAchievementByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Achievement successfully',
        result: true,
    });
});
exports.deleteAchievementById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, achievementUseCase_1.deleteAchievementByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Achievement successfully',
        result: true,
    });
});
exports.getAchievementById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const achievement = await (0, achievementUseCase_1.getAchievementByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Achievement successfully',
        result: achievement,
    });
});
