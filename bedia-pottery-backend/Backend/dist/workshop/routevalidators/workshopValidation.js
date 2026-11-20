"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workshopCapacitySchema = void 0;
exports.workshopCapacitySchema = {
    type: 'object',
    properties: {
        bookingDate: {
            type: 'string',
            minLength: 1,
        },
        startTime: {
            type: 'string',
            minLength: 1,
        },
        endTime: {
            type: 'string',
            minLength: 1,
        },
    },
    required: ['bookingDate', 'startTime', 'endTime'],
    additionalProperties: false,
};
