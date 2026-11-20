"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.generateTokenUser = generateTokenUser;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configKeys_1 = __importDefault(require("../configKeys"));
/**
 * Storefront customers stay signed in for a week: long enough to come back to a
 * cart across a normal shopping week, short enough to bound the damage of a
 * leaked token.
 *
 * That bound matters here because `authMiddleware` verifies the signature only
 * and never checks the session stored in `userAuthModel` — a token cannot be
 * revoked, so its lifetime is the only limit on it.
 */
const USER_TOKEN_DURATION = '7d';
/** Admin tokens. Deliberately long-lived; customers use `generateTokenUser`. */
function generateToken(payload) {
    const token = jsonwebtoken_1.default.sign(payload, configKeys_1.default.JWT_SECRET, {
        expiresIn: '100000d',
    });
    return token;
}
function generateTokenUser(payload) {
    const token = jsonwebtoken_1.default.sign(payload, configKeys_1.default.JWT_SECRET, {
        expiresIn: USER_TOKEN_DURATION,
    });
    return token;
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, configKeys_1.default.JWT_SECRET);
}
