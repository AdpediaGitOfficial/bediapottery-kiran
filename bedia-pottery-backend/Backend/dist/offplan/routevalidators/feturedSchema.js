"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featuredBodySchema = void 0;
exports.featuredBodySchema = {
    type: 'object',
    properties: {
        id: { type: 'string', minLength: 1 },
        featuredProperty: { type: 'boolean' },
    },
    required: ['id', 'featuredProperty'],
    additionalProperties: true,
};
