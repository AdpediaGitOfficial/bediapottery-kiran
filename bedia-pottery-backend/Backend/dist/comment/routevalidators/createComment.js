"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentBodySchema = void 0;
exports.commentBodySchema = {
    type: 'object',
    properties: {
        postId: { type: 'string', minLength: 1 },
        comment: { type: 'string', minLength: 1 },
        parentId: { type: 'string', nullable: true },
    },
    required: ['postId', 'comment'],
    additionalProperties: false,
};
