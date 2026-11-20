"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAchievementSchema = void 0;
exports.createAchievementSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        image: { type: 'string', minLength: 1 },
    },
    required: ['title', 'image'],
    additionalProperties: true,
};
