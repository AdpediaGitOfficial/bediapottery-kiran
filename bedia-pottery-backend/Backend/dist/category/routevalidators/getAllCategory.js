"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategorySchema = void 0;
exports.getAllCategorySchema = {
    type: 'object',
    properties: {
        page: {
            type: 'string',
            nullable: true,
        },
        limit: {
            type: 'string',
            nullable: true,
        },
        search: {
            type: 'string',
            nullable: true,
        },
        parentId: {
            type: 'string',
            nullable: true,
        },
    },
    additionalProperties: false,
};
