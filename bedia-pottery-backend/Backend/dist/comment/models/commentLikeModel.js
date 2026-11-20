"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentLikeSchema = new mongoose_1.Schema({
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'comment', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { timestamps: true });
// One like per user per comment
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
const commentLikeModel = (0, mongoose_1.model)('commentLike', commentLikeSchema);
exports.default = commentLikeModel;
