"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqBodySchema = void 0;
exports.faqBodySchema = {
    type: 'object',
    properties: {
        question: {
            type: 'string',
            minLength: 1,
        },
        answer: {
            type: 'string',
            minLength: 1,
        },
        category: {
            type: 'string',
            nullable: true,
        },
        isActive: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: ['question', 'answer'],
    additionalProperties: false,
};
