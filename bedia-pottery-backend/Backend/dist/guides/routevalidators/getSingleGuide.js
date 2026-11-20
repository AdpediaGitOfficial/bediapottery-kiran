"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleGuideSchema = void 0;
exports.getSingleGuideSchema = {
    type: 'object',
    properties: {
        purpose: { type: 'string', minLength: 1 },
        type: { type: 'string', nullable: true },
    },
    required: ['purpose'],
    additionalProperties: false,
};
