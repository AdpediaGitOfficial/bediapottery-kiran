"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPageMetaSchema = void 0;
exports.createPageMetaSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        image: { type: 'string', minLength: 1 },
        url: { type: 'string', minLength: 1 },
        keywords: { type: 'string', minLength: 1 },
    },
    required: ['title', 'description', 'image', 'url', 'keywords'],
    additionalProperties: false,
};
