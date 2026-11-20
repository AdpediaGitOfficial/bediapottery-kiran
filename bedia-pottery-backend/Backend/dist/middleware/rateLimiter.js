"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchXMLLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const configKeys_1 = __importDefault(require("../configKeys"));
// Create a rate limiter specifically for login attempts
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configKeys_1.default.LOGIN_LIMIT,
    message: {
        error: 'Too many login attempts, please try again later',
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    // Optional: Track attempts by user email instead of IP
    keyGenerator: (req) => {
        return req.body.email || req.ip;
    },
});
// Create a rate limiter specifically for fetchXML attempts
exports.fetchXMLLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3
    message: {
        error: 'Too many fetch attempts, please try again later',
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    // Optional: Track attempts by user email instead of IP
    keyGenerator: (req) => {
        return req.body.email || req.ip;
    },
});
