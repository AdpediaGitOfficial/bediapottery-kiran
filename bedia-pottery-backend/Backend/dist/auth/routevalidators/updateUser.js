"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
exports.updateUserSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        designation: { type: 'string', minLength: 1, nullable: true },
        newPassword: { type: 'string', nullable: true },
        oldPassword: { type: 'string', nullable: true },
    },
    required: ['name', 'email'],
    additionalProperties: false,
};
