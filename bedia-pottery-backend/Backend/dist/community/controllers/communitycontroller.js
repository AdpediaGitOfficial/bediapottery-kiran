"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewLaunchProject = exports.getCommunityProjectBySlug = exports.getAllCommunityProjects = exports.addNewLaunchProject = exports.getCommunitiesCountController = exports.deleteCommunity = exports.updateCommunity = exports.getCommunityBySlug = exports.getAllCommunities = exports.createCommunity = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const community_1 = require("../usecases/community");
// Create Community Controller
exports.createCommunity = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, community_1.createCommunityUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Community created successfully',
        result: true,
    });
});
exports.getAllCommunities = (0, express_async_handler_1.default)(async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    const communities = await (0, community_1.getAllCommunitiesUseCase)(Number(page), Number(limit));
    res.status(200).json({
        success: true,
        message: 'Communities fetched successfully',
        data: communities,
    });
});
exports.getCommunityBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    try {
        const community = await (0, community_1.getCommunityBySlugUseCase)(slug);
        res.status(200).json({
            success: true,
            data: community,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Community not found',
        });
    }
});
exports.updateCommunity = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const updatedCommunity = await (0, community_1.updateCommunityUseCase)(id, updateData);
        res.status(200).json({
            success: true,
            message: 'Community updated successfully',
            data: updatedCommunity,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update community',
        });
    }
});
exports.deleteCommunity = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        await (0, community_1.deleteCommunityUseCase)(id);
        res.status(200).json({
            success: true,
            message: 'Community deleted successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete community',
        });
    }
});
exports.getCommunitiesCountController = (0, express_async_handler_1.default)(async (req, res) => {
    const count = await (0, community_1.getCommunitiesCountUseCase)();
    res.status(200).json({
        success: true,
        message: 'Community count fetched successfully',
        count: count,
    });
});
exports.addNewLaunchProject = (0, express_async_handler_1.default)(async (req, res) => {
    const { communityId } = req.params;
    const projectData = req.body;
    const updatedCommunity = await (0, community_1.addNewLaunchProjectUseCase)(communityId, projectData);
    res.status(200).json({
        success: true,
        message: 'New Launch Project added successfully',
        community: updatedCommunity,
    });
});
exports.getAllCommunityProjects = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, community_1.getAllNewLaunchProjectsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched all New Launch Projects successfully',
        result,
    });
});
exports.getCommunityProjectBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { communitySlug, slug } = req.params;
    const project = await (0, community_1.getNewLaunchProjectBySlugUseCase)(communitySlug, slug);
    res.status(200).json({
        success: true,
        message: 'Fetched New Launch Project successfully',
        result: project,
    });
});
exports.updateNewLaunchProject = (0, express_async_handler_1.default)(async (req, res) => {
    const { communityId, projectSlug } = req.params;
    const updateData = req.body;
    const updatedProject = await (0, community_1.updateNewLaunchProjectUseCase)(communityId, projectSlug, updateData);
    res.status(200).json({
        success: true,
        message: 'Community Project updated successfully',
        result: updatedProject,
    });
});
