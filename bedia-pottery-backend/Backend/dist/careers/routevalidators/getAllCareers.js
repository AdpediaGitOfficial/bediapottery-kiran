"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCareerSchema = void 0;
exports.getAllCareerSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        jobSlug: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
