"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGallerySchema = void 0;
exports.createGallerySchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            minLength: 1,
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
            minItems: 1,
        },
        description: {
            type: 'string',
            nullable: true,
        },
        isActive: {
            type: 'boolean',
        },
    },
    required: ['title', 'images'],
    additionalProperties: false,
};
