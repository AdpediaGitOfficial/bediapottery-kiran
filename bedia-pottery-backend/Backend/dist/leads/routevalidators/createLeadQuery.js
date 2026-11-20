"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadQuerySchema = void 0;
exports.createLeadQuerySchema = {
    type: 'object',
    properties: {
        download: { type: 'string', enum: ['floorplan', 'brochure', 'report'], nullable: true },
    },
    required: [],
    additionalProperties: true,
};
