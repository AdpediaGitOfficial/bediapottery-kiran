"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeComment = exports.likeComment = exports.deleteCommentById = exports.updateCommentById = exports.createComment = exports.getCommentsByPostId = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const commentUseCase_1 = require("../useCases/commentUseCase");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAuthUser = (req) => {
    const user = req.user;
    if (!user || !user.userId) {
        throw new appError_1.default('Invalid token. User not identified', httpStatus_1.HttpStatus.UNAUTHORIZED);
    }
    return user;
};
exports.getCommentsByPostId = (0, express_async_handler_1.default)(async (req, res) => {
    const { postId } = req.params;
    const comments = await (0, commentUseCase_1.getCommentsByPostIdUseCase)(postId, req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Comments successfully',
        result: comments,
    });
});
exports.createComment = (0, express_async_handler_1.default)(async (req, res) => {
    const user = getAuthUser(req);
    const data = req.body;
    await (0, commentUseCase_1.createCommentUseCase)(data, user.userId);
    res.status(200).json({
        success: true,
        message: 'Created Comment successfully',
        result: true,
    });
});
exports.updateCommentById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = getAuthUser(req);
    const { id } = req.params;
    const data = req.body;
    await (0, commentUseCase_1.updateCommentByIdUseCase)(id, user.userId, data);
    res.status(200).json({
        success: true,
        message: 'Updated Comment successfully',
        result: true,
    });
});
exports.deleteCommentById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = getAuthUser(req);
    const { id } = req.params;
    await (0, commentUseCase_1.deleteCommentByIdUseCase)(id, user);
    res.status(200).json({
        success: true,
        message: 'Deleted Comment successfully',
        result: true,
    });
});
exports.likeComment = (0, express_async_handler_1.default)(async (req, res) => {
    const user = getAuthUser(req);
    const { id } = req.params;
    await (0, commentUseCase_1.likeCommentUseCase)(id, user.userId);
    res.status(200).json({
        success: true,
        message: 'Liked Comment successfully',
        result: true,
    });
});
exports.unlikeComment = (0, express_async_handler_1.default)(async (req, res) => {
    const user = getAuthUser(req);
    const { id } = req.params;
    await (0, commentUseCase_1.unlikeCommentUseCase)(id, user.userId);
    res.status(200).json({
        success: true,
        message: 'Unliked Comment successfully',
        result: true,
    });
});
