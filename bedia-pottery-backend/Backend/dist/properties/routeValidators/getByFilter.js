"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByFilterSchema = void 0;
exports.getByFilterSchema = {
    type: 'object',
    properties: {
        propertyPurpose: { type: 'string', enum: ['Buy', 'Rent'] },
        search: { type: 'array', items: { type: 'string' }, nullable: true },
        propertyType: { type: 'string', nullable: true },
        price: {
            type: 'object',
            properties: {
                min: { type: 'number', nullable: true },
                max: { type: 'number', nullable: true },
            },
            required: [],
            additionalProperties: false,
            nullable: true,
        },
        bedrooms: {
            type: 'object',
            properties: {
                min: { type: 'number', nullable: true },
                max: { type: 'number', nullable: true },
            },
            required: [],
            additionalProperties: false,
            nullable: true,
        },
        propertySize: {
            type: 'object',
            properties: {
                min: { type: 'number', nullable: true },
                max: { type: 'number', nullable: true },
            },
            required: [],
            additionalProperties: false,
            nullable: true,
        },
        features: { type: 'array', items: { type: 'string' }, nullable: true },
        sortBy: { type: 'string', nullable: true },
        order: { type: 'string', enum: ['asc', 'desc'], nullable: true },
        page: { type: 'number', nullable: true },
        limit: { type: 'number', nullable: true },
    },
    required: ['propertyPurpose'],
    additionalProperties: false,
};
