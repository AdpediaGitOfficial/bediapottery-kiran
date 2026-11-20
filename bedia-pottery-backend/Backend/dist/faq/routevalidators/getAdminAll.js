"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAllFaqsSchema = void 0;
exports.getAdminAllFaqsSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        category: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
