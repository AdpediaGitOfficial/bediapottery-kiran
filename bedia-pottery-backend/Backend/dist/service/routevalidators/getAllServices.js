"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllServiceSchema = void 0;
exports.getAllServiceSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
        serviceTypeId: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
