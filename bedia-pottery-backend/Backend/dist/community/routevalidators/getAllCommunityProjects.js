"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommunityProjectsSchema = void 0;
exports.getCommunityProjectsSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        sortBy: { type: 'string', nullable: true },
        order: { type: 'string', enum: ['asc', 'desc'], nullable: true },
    },
    required: [],
    additionalProperties: false,
};
