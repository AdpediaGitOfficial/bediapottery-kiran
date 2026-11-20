"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceTypeSchema = void 0;
exports.createServiceTypeSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        image: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
    },
    required: ['title'],
    additionalProperties: true,
};
