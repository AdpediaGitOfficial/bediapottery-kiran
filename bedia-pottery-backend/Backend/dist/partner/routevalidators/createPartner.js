"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPartnerSchema = void 0;
exports.createPartnerSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        logo: { type: 'string', minLength: 1 },
        websiteUrl: { type: 'string', minLength: 1 },
    },
    required: ['name', 'logo', 'websiteUrl'],
    additionalProperties: false,
};
