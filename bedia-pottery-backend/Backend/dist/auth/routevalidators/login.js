"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = void 0;
exports.loginUserSchema = {
    type: 'object',
    properties: {
        email: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 1 },
    },
    required: ['email', 'password'],
    additionalProperties: false,
};
