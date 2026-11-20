"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBrochureSchema = void 0;
exports.getAllBrochureSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
