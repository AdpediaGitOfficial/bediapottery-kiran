"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTermsAndConditionsSchema = void 0;
exports.getAllTermsAndConditionsSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        isActive: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
