"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWorkshopSchema = void 0;
exports.getAllWorkshopSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        categoryId: { type: 'string', nullable: true },
        isActive: { type: 'string', nullable: true },
        slug: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
