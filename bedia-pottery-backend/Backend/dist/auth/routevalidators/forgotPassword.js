"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = void 0;
exports.forgotPasswordSchema = {
    type: 'object',
    properties: {
        email: { type: 'string', minLength: 1, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
    },
    required: ['email'],
    additionalProperties: false,
};
