"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeCommentUseCase = exports.likeCommentUseCase = exports.deleteCommentByIdUseCase = exports.updateCommentByIdUseCase = exports.createCommentUseCase = exports.getCommentsByPostIdUseCase = void 0;
const commentRepo_1 = require("../repos/commentRepo");
const commentLikeRepo_1 = require("../repos/commentLikeRepo");
const blogRepo_1 = require("../../blog/repos/blogRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const formatComment = (comment, likesCountMap) => ({
    _id: comment._id,
    postId: comment.postId,
    parentId: comment.parentId,
    comment: comment.comment,
    user: comment.userId,
    likesCount: likesCountMap[comment._id.toString()] || 0,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
});
const getCommentsByPostIdUseCase = async (postId, queryParams) => {
    if (!(0, objectIdParser_1.ObjectID)(postId)) {
        throw new appError_1.default('No Post Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const { page = '1', limit = '10' } = queryParams;
    const query = { postId: (0, objectIdParser_1.ObjectID)(postId), parentId: null, isDeleted: false };
    const totalCount = await (0, commentRepo_1.getCommentsCount)(query);
    if (!totalCount)
        return { totalCount: 0, comments: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parentComments = await (0, commentRepo_1.fetchParentCommentsByPostId)(postId, skip, parseInt(limit));
    const parentIds = parentComments.map((comment) => comment._id);
    const replies = await (0, commentRepo_1.fetchRepliesByParentIds)(parentIds);
    const allIds = [...parentIds, ...replies.map((reply) => reply._id)];
    const likesCountMap = await (0, commentLikeRepo_1.getLikesCountByCommentIds)(allIds);
    const comments = parentComments.map((parent) => ({
        ...formatComment(parent, likesCountMap),
        replies: replies
            .filter((reply) => reply.parentId?.toString() === String(parent._id))
            .map((reply) => formatComment(reply, likesCountMap)),
    }));
    return { totalCount, comments };
};
exports.getCommentsByPostIdUseCase = getCommentsByPostIdUseCase;
const createCommentUseCase = async (data, userId) => {
    if (!(0, objectIdParser_1.ObjectID)(data.postId)) {
        throw new appError_1.default('No Post Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const post = await (0, blogRepo_1.fetchBlogById)(data.postId);
    if (!post) {
        throw new appError_1.default('No Post Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    let parentId = null;
    if (data.parentId) {
        if (!(0, objectIdParser_1.ObjectID)(data.parentId)) {
            throw new appError_1.default('No Parent Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
        }
        const parentComment = await (0, commentRepo_1.fetchCommentById)(data.parentId);
        if (!parentComment) {
            throw new appError_1.default('No Parent Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
        }
        if (parentComment.postId.toString() !== data.postId) {
            throw new appError_1.default('Parent Comment does not belong to this Post', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        if (parentComment.parentId) {
            throw new appError_1.default('Cannot reply to a reply', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        parentId = data.parentId;
    }
    const comment = await (0, commentRepo_1.createComment)({
        postId: data.postId,
        userId,
        comment: data.comment,
        parentId,
    });
    if (!comment) {
        throw new appError_1.default('Couldn\'t Create new Comment. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createCommentUseCase = createCommentUseCase;
const updateCommentByIdUseCase = async (id, userId, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const comment = await (0, commentRepo_1.updateCommentById)(id, userId, data);
        if (!comment)
            throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
        return comment;
    }
    throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateCommentByIdUseCase = updateCommentByIdUseCase;
const deleteCommentByIdUseCase = async (id, user) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const isAdmin = user.role === 'admin' || user.role === 'administrator';
        const comment = await (0, commentRepo_1.deleteCommentById)(id, isAdmin ? undefined : user.userId);
        if (comment) {
            // remove replies of a deleted parent comment as well
            if (!comment.parentId) {
                await (0, commentRepo_1.deleteRepliesByParentId)(id);
            }
            return true;
        }
    }
    throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteCommentByIdUseCase = deleteCommentByIdUseCase;
const likeCommentUseCase = async (commentId, userId) => {
    if (!(0, objectIdParser_1.ObjectID)(commentId)) {
        throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const comment = await (0, commentRepo_1.fetchCommentById)(commentId);
    if (!comment) {
        throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    await (0, commentLikeRepo_1.addCommentLike)(commentId, userId);
    return true;
};
exports.likeCommentUseCase = likeCommentUseCase;
const unlikeCommentUseCase = async (commentId, userId) => {
    if (!(0, objectIdParser_1.ObjectID)(commentId)) {
        throw new appError_1.default('No Comment Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    await (0, commentLikeRepo_1.removeCommentLike)(commentId, userId);
    return true;
};
exports.unlikeCommentUseCase = unlikeCommentUseCase;
