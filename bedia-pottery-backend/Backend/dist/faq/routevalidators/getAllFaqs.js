"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFaqsSchema = void 0;
exports.getAllFaqsSchema = {
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
