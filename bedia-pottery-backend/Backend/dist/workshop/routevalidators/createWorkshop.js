"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkshopSchema = void 0;
exports.createWorkshopSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        images: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    image: { type: 'string', minLength: 1 },
                    title: { type: 'string', nullable: true },
                },
                required: ['image'],
                additionalProperties: false,
            },
        },
        bannerImage: { type: 'string', nullable: true },
        categoryId: { type: 'string', minLength: 1 },
        shortDescription: { type: 'string', nullable: true },
        description: { type: 'string', minLength: 1 },
        overview: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        showOnHomepage: {
            type: 'boolean',
            nullable: true,
        },
        includes: {
            type: 'array',
            nullable: true,
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', minLength: 1 },
                    icon: { type: 'string', nullable: true },
                },
                required: ['title'],
                additionalProperties: false,
            },
        },
        moreDetails: {
            type: 'array',
            nullable: true,
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', minLength: 1 },
                    icon: { type: 'string', nullable: true },
                    description: { type: 'string', nullable: true },
                },
                required: ['title'],
                additionalProperties: false,
            },
        },
        /* -------- DEFAULT SLOTS -------- */
        defaultSlots: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string', minLength: 1 },
                    startTime: { type: 'string', minLength: 1 },
                    endTime: { type: 'string', minLength: 1 },
                    capacity: { type: 'number', minimum: 1, nullable: true },
                },
                required: ['label', 'startTime', 'endTime'],
                additionalProperties: true,
            },
        },
        /* -------- OPTIONS -------- */
        options: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    clayType: { type: 'string', nullable: true },
                    title: { type: 'string', minLength: 1 },
                    price: { type: 'number', minimum: 0 },
                    currency: { type: 'string', nullable: true },
                    priceDescription: { type: 'string', nullable: true },
                    description: { type: 'string', nullable: true },
                    inclusions: {
                        type: 'array',
                        items: { type: 'string', minLength: 1 },
                        nullable: true,
                    },
                    image: { type: 'string', nullable: true },
                    // Optional per-clayType thumbnail + video (not mandatory)
                    clayTypethumbnailImage: { type: 'string', nullable: true },
                    clayTypeVideo: { type: 'string', nullable: true },
                },
                required: ['title', 'price'],
                additionalProperties: true,
            },
        },
        nonAvailabilityDates: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
        },
        nonAvailabilityDays: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
        },
        journeyImage: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
        },
        isActive: { type: 'boolean', nullable: true },
    },
    required: ['title', 'images', 'categoryId', 'description', 'defaultSlots', 'options'],
    additionalProperties: true,
};
