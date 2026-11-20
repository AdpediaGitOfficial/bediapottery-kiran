"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExclusivePropertiesSchema = void 0;
exports.getExclusivePropertiesSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
