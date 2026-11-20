"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAchievementSchema = void 0;
exports.getAllAchievementSchema = {
    type: 'object',
    properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
        search: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: false,
};
