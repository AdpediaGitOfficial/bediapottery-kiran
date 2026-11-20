"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLikesByCommentIds = exports.getLikesCountByCommentIds = exports.getCommentLikesCount = exports.removeCommentLike = exports.addCommentLike = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const commentLikeModel_1 = __importDefault(require("../models/commentLikeModel"));
const addCommentLike = async (commentId, userId) => {
    await commentLikeModel_1.default.updateOne({ commentId: (0, objectIdParser_1.ObjectID)(commentId), userId: (0, objectIdParser_1.ObjectID)(userId) }, { $setOnInsert: { commentId: (0, objectIdParser_1.ObjectID)(commentId), userId: (0, objectIdParser_1.ObjectID)(userId) } }, { upsert: true });
    return true;
};
exports.addCommentLike = addCommentLike;
const removeCommentLike = async (commentId, userId) => {
    await commentLikeModel_1.default.deleteOne({
        commentId: (0, objectIdParser_1.ObjectID)(commentId),
        userId: (0, objectIdParser_1.ObjectID)(userId),
    });
    return true;
};
exports.removeCommentLike = removeCommentLike;
const getCommentLikesCount = async (commentId) => {
    return await commentLikeModel_1.default.countDocuments({ commentId: (0, objectIdParser_1.ObjectID)(commentId) });
};
exports.getCommentLikesCount = getCommentLikesCount;
const getLikesCountByCommentIds = async (commentIds) => {
    const counts = await commentLikeModel_1.default.aggregate([
        { $match: { commentId: { $in: commentIds } } },
        { $group: { _id: '$commentId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((item) => {
        countMap[item._id.toString()] = item.count;
    });
    return countMap;
};
exports.getLikesCountByCommentIds = getLikesCountByCommentIds;
const removeLikesByCommentIds = async (commentIds) => {
    await commentLikeModel_1.default.deleteMany({ commentId: { $in: commentIds } });
    return true;
};
exports.removeLikesByCommentIds = removeLikesByCommentIds;
