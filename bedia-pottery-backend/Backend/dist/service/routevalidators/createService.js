"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceSchema = void 0;
exports.createServiceSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        image: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
        },
        bannerImage: { type: 'string', nullable: true },
        serviceTypeId: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        shortDescription: { type: 'string', minLength: 1 },
        overview: { type: 'string', minLength: 1 },
        imageDescription: { type: 'string', nullable: true },
        imageTitle: { type: 'string', nullable: true },
        keyAdvantages: {
            type: 'object',
            nullable: true, // 🔥 IMPORTANT
            properties: {
                title: { type: 'string', nullable: true },
                description: { type: 'string', nullable: true },
                items: {
                    type: 'array',
                    nullable: true,
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', nullable: true },
                            description: { type: 'string', nullable: true },
                        },
                        additionalProperties: false,
                    },
                },
            },
            additionalProperties: false,
        },
        isActive: { type: 'boolean', nullable: true },
    },
    required: ['title', 'image', 'description', 'shortDescription', 'overview', 'serviceTypeId'],
    additionalProperties: false,
};
