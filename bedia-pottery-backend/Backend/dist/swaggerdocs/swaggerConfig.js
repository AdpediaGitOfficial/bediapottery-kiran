"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const logger_1 = __importDefault(require("../config/logger"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bediapottery API',
            version: '1.0.0',
            description: 'backend API for Bediapottery platform',
        },
    },
    apis: ['./swaggerdocs/*.yaml'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    // Basic authentication middleware
    const authMiddleware = (0, express_basic_auth_1.default)({
        users: {
            admin: process.env.SWAGGER_PASSWORD, // Replace with your desired username and password
        },
        challenge: true, // Show authentication dialog
        realm: 'Bediapottery API Docs',
    });
    // Apply authentication to Swagger routes
    app.use('/api/docs', authMiddleware, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    app.get('/docs.json', authMiddleware, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    logger_1.default.info('Docs available at /api/docs (password-protected)');
}
exports.default = setupSwagger;
