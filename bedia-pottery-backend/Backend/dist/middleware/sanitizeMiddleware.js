"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const additionalAllowedTags = [
    'span',
    'img',
    'a',
    'br',
    'strong',
    'em',
    's',
    'blockquote',
    'b',
    'u',
    'ol',
    'li',
    'ul',
];
// Middleware to sanitize the body fields
const sanitizeBody = [
    // Sanitize specific fields, replace '*' with actual field names you want to sanitize
    (0, express_validator_1.body)('*').customSanitizer((value) => {
        if (typeof value === 'string') {
            return (0, sanitize_html_1.default)(value, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(additionalAllowedTags),
                allowedAttributes: {
                    img: ['class', 'style', 'src', 'alt', 'width', 'height'], // Allow specific attributes for img
                    a: ['href', 'target', 'rel', 'class', 'style'], // Ensure a tag attributes are covered as well
                    span: ['class', 'style'], // Ensure span attributes are covered as well
                    strong: ['class', 'style'], // Ensure span attributes are covered as well
                    s: ['class', 'style'], // Ensure span attributes are covered as well
                    em: ['class', 'style'], // Ensure span attributes are covered as well
                    u: ['class', 'style'], // Ensure span attributes are covered as well
                    li: ['class', 'style'], // Ensure span attributes are covered as well
                },
                allowedSchemes: ['http', 'https', 'data'], // Allow data URIs for img src (base64)
                allowedSchemesByTag: {
                    img: ['http', 'https', 'data'], // Specifically allow data URIs for img tags
                },
                textFilter: function (text) {
                    // Custom filtering logic
                    return text.replace(/&amp;/g, '&');
                },
            });
        }
        return value;
    }),
    // Middleware to handle validation result and proceed with sanitized data
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
exports.default = sanitizeBody;
