"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentSchema = void 0;
exports.createAgentSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        designation: { type: 'string', minLength: 1 },
        image: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        whatsapp: { type: 'string' },
        brnNo: { type: 'string' },
        languages: { type: 'array', items: { type: 'string' } },
        type: { type: 'string', minLength: 1 },
    },
    required: ['name', 'email', 'phone', 'designation', 'type'],
    // required: ['name', 'email', 'phone', 'image', 'designation', 'languages', 'type'],
    additionalProperties: false,
};
