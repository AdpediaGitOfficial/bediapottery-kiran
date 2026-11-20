"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCommentsSchema = void 0;
exports.getAllCommentsSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
