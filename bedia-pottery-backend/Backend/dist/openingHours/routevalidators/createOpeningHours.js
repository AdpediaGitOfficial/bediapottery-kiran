"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpeningHoursSchema = void 0;
exports.createOpeningHoursSchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
        },
        days: {
            type: 'string',
            minLength: 1,
        },
        openTime: {
            type: 'string',
            minLength: 1,
        },
        closeTime: {
            type: 'string',
            minLength: 1,
        },
        isActive: {
            type: 'boolean',
        },
    },
    required: ['days', 'openTime', 'closeTime'],
    additionalProperties: false,
};
