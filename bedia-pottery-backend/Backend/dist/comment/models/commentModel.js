"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'blog', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'comment', default: null, index: true },
    comment: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const commentModel = (0, mongoose_1.model)('comment', commentSchema);
exports.default = commentModel;
