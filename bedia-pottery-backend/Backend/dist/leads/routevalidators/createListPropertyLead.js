"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListPropertyLeadSchema = void 0;
exports.createListPropertyLeadSchema = {
    type: 'object',
    properties: {
        userName: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        leadType: { type: 'string', minLength: 1 },
        preferredLanguage: { type: 'string', minLength: 1 },
        propertyAddress: { type: 'string', minLength: 1 },
        propertyType: { type: 'string', minLength: 1 },
        message: { type: 'string', minLength: 1 },
        bedrooms: { type: 'string', minLength: 1 },
    },
    required: [
        'userName',
        'email',
        'phone',
        'leadType',
        'preferredLanguage',
        'propertyAddress',
        'propertyType',
        'message',
        'bedrooms',
    ],
    additionalProperties: false,
};
