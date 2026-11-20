"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGallerySchema = void 0;
exports.getAllGallerySchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
