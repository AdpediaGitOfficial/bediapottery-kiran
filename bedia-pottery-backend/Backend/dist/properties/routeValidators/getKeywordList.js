"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeywordListSchema = void 0;
exports.getKeywordListSchema = {
    type: 'object',
    properties: {
        propertyPurpose: { type: 'string', enum: ['Buy', 'Rent'] },
        keyword: { type: 'string', nullable: true },
    },
    required: ['propertyPurpose'],
    additionalProperties: false,
};
