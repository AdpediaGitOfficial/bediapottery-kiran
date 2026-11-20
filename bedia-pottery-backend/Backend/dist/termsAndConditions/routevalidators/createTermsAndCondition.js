"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.termsAndConditionBodySchema = void 0;
exports.termsAndConditionBodySchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            minLength: 1,
        },
        content: {
            type: 'string',
            minLength: 1,
        },
        isActive: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: ['title', 'content'],
    additionalProperties: false,
};
