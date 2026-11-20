"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertiesSchema = void 0;
exports.getAllPropertiesSchema = {
    type: 'object',
    properties: {
        propertyPurpose: { type: 'string', nullable: true },
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        sortBy: { type: 'string', nullable: true },
        order: { type: 'string', nullable: true },
        location: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
