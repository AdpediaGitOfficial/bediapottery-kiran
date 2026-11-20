"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = exports.userAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configKeys_1 = __importDefault(require("../../configKeys"));
const userAuthMiddleware = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, configKeys_1.default.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid token' });
        }
    }
    else {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
};
exports.userAuthMiddleware = userAuthMiddleware;
const adminAuthMiddleware = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, configKeys_1.default.JWT_SECRET);
            if (decoded.role !== 'administrator') {
                return res.status(403).json({ message: 'Access denied.' });
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid token' });
        }
    }
    else {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
