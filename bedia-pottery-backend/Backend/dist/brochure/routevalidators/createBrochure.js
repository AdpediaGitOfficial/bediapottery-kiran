"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrochureSchema = void 0;
exports.createBrochureSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        fileUrl: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
    },
    required: ['title'],
    additionalProperties: true,
};
