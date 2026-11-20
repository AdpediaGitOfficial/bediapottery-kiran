"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadByDateSchema = void 0;
exports.getLeadByDateSchema = {
    type: 'object',
    properties: {
        startDate: { type: 'string', minLength: 1 },
        endDate: { type: 'string', minLength: 1 },
        leadType: { type: 'string', nullable: true },
    },
    required: ['startDate', 'endDate'],
    additionalProperties: true,
};
