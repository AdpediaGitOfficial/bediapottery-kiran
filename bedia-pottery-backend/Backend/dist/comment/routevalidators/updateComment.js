"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentUpdateBodySchema = void 0;
exports.commentUpdateBodySchema = {
    type: 'object',
    properties: {
        comment: { type: 'string', minLength: 1 },
    },
    required: ['comment'],
    additionalProperties: false,
};
