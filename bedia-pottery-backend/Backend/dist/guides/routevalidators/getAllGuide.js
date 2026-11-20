"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGuideSchema = void 0;
exports.getAllGuideSchema = {
    type: 'object',
    properties: {
        purpose: { type: 'string', minLength: 1 },
        // page: { type: 'string', nullable: true },
        // limit: { type: 'string', nullable: true },
        // search: { type: 'string', nullable: true },
    },
    required: ['purpose'],
    additionalProperties: false,
};
