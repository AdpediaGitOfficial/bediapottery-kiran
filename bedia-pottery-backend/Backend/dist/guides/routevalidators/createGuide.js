"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuideSchema = void 0;
exports.createGuideSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        image1: { type: 'string', minLength: 1 },
        image2: { type: 'string', minLength: 1 },
        content: { type: 'string', minLength: 1 },
        propertyType: { type: 'string', nullable: true },
        propertyPurpose: { type: 'string', minLength: 1 },
    },
    required: ['title', 'image1', 'image2', 'content', 'propertyPurpose'],
    additionalProperties: false,
};
