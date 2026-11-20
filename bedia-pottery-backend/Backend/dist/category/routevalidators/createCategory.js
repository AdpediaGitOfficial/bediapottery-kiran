"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
exports.createCategorySchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            minLength: 1,
        },
        image: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
        },
        description: {
            type: 'string',
            nullable: true,
        },
        shortDescription: {
            type: 'string',
            nullable: true,
        },
        parentId: {
            type: 'string',
            nullable: true,
        },
        showOnHomepage: {
            type: 'boolean',
            nullable: true,
        },
        isActive: { type: 'boolean', nullable: true },
    },
    required: ['title'],
    additionalProperties: false,
};
