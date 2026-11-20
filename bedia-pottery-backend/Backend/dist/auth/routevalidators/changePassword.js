"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = void 0;
exports.changePasswordSchema = {
    type: 'object',
    properties: {
        email: { type: 'string', minLength: 1 },
        oldPassword: { type: 'string', minLength: 1 },
        newPassword: { type: 'string', minLength: 1 },
    },
    required: ['email', 'oldPassword', 'newPassword'],
    additionalProperties: false,
};
