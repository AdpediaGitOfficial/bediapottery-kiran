"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = void 0;
exports.registerUserSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        designation: { type: 'string', minLength: 1, nullable: true },
        password: { type: 'string', minLength: 1 },
    },
    required: ['name', 'email', 'password'],
    additionalProperties: false,
};
