"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = void 0;
exports.resetPasswordSchema = {
    type: 'object',
    properties: {
        token: { type: 'string', minLength: 1 },
        newPassword: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$',
        },
    },
    required: ['token', 'newPassword'],
    additionalProperties: false,
};
