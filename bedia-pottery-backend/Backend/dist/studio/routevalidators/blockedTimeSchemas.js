"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedTimeRangeSchema = exports.createBlockedTimeSchema = void 0;
exports.createBlockedTimeSchema = {
    type: 'object',
    properties: {
        date: { type: 'string', minLength: 10 },
        allSlots: { type: 'boolean', nullable: true },
        startTime: { type: 'string', nullable: true },
        endTime: { type: 'string', nullable: true },
        reason: { type: 'string', minLength: 1, maxLength: 200 },
    },
    required: ['date', 'reason'],
    additionalProperties: false,
};
exports.blockedTimeRangeSchema = {
    type: 'object',
    properties: {
        from: { type: 'string', nullable: true },
        to: { type: 'string', nullable: true },
    },
    additionalProperties: false,
};
