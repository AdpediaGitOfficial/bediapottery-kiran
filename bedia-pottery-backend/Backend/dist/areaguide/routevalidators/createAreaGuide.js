"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAreaGuideSchema = void 0;
exports.createAreaGuideSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        shortDescription: { type: 'string', minLength: 1 },
        latitude: { type: 'string', minLength: 1 },
        longitude: { type: 'string', minLength: 1 },
        image: { type: 'string', minLength: 1 },
        subTitle: { type: 'string', minLength: 1 },
        faq: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    question: { type: 'string', minLength: 1 },
                    answer: { type: 'string', minLength: 1 },
                },
                required: ['question', 'answer'],
                additionalProperties: false,
            },
        },
    },
    required: [
        'name',
        'subTitle',
        'shortDescription',
        'description',
        'latitude',
        'longitude',
        'image',
        'faq',
    ],
    additionalProperties: false,
};
