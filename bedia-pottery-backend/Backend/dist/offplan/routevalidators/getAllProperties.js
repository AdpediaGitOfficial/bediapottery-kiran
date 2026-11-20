"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertiesSchema = void 0;
exports.getAllPropertiesSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        sortBy: { type: 'string', nullable: true },
        order: { type: 'string', enum: ['asc', 'desc'], nullable: true },
        featured: { type: 'string', enum: ['true', 'false'], nullable: true },
    },
    required: [],
    additionalProperties: false,
};
