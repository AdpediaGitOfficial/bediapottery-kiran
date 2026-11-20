"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRepliesByParentId = exports.deleteCommentById = exports.updateCommentById = exports.createComment = exports.fetchCommentById = exports.fetchRepliesByParentIds = exports.fetchParentCommentsByPostId = exports.getCommentsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const commentModel_1 = __importDefault(require("../models/commentModel"));
const getCommentsCount = async (query) => {
    return await commentModel_1.default.countDocuments(query);
};
exports.getCommentsCount = getCommentsCount;
const fetchParentCommentsByPostId = async (postId, skip, limit) => {
    const dbQuery = {
        postId: (0, objectIdParser_1.ObjectID)(postId),
        parentId: null,
        isDeleted: false,
    };
    return await commentModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .populate('userId', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchParentCommentsByPostId = fetchParentCommentsByPostId;
const fetchRepliesByParentIds = async (parentIds) => {
    const dbQuery = {
        parentId: { $in: parentIds },
        isDeleted: false,
    };
    return await commentModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .populate('userId', 'fullName avatar')
        .sort({ createdAt: 1 })
        .lean();
};
exports.fetchRepliesByParentIds = fetchRepliesByParentIds;
const fetchCommentById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await commentModel_1.default.findOne(dbQuery).select({ isDeleted: 0, __v: 0 }).lean();
};
exports.fetchCommentById = fetchCommentById;
const createComment = async (data) => {
    return await commentModel_1.default.create(data);
};
exports.createComment = createComment;
const updateCommentById = async (id, userId, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        userId: (0, objectIdParser_1.ObjectID)(userId),
        isDeleted: false,
    };
    return await commentModel_1.default.findOneAndUpdate(dbQuery, data, { new: true });
};
exports.updateCommentById = updateCommentById;
const deleteCommentById = async (id, userId) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    if (userId)
        dbQuery.userId = (0, objectIdParser_1.ObjectID)(userId);
    return await commentModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteCommentById = deleteCommentById;
const deleteRepliesByParentId = async (parentId) => {
    await commentModel_1.default.updateMany({ parentId: (0, objectIdParser_1.ObjectID)(parentId), isDeleted: false }, { isDeleted: true });
    return true;
};
exports.deleteRepliesByParentId = deleteRepliesByParentId;
