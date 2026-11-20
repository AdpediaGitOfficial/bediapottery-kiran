"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOpeningHoursSchema = void 0;
exports.getAllOpeningHoursSchema = {
    type: 'object',
    properties: {
        page: {
            type: 'string',
            nullable: true,
        },
        limit: {
            type: 'string',
            nullable: true,
        },
        search: {
            type: 'string',
            nullable: true,
        },
    },
    additionalProperties: false,
};
