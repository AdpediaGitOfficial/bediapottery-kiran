"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCareerFooterSchema = void 0;
exports.createCareerFooterSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        content: { type: 'string', minLength: 1 },
        image: { type: 'string', minLength: 1 },
    },
    required: ['title', 'content', 'image'],
    additionalProperties: false,
};
