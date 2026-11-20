"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClayTypeSchema = void 0;
exports.getAllClayTypeSchema = {
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
