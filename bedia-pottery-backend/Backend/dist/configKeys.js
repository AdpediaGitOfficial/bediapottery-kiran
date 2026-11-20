"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const configKeys = {
    DATABASE_URL: process.env.DATABASE,
    PORT: process.env.PORT,
    XML_API: process.env.XML_API,
    BASE_DIR_PATH: path_1.default.join(__dirname),
    CORS_URLS: process.env.CORS_URLS,
    CLIENT_MAIL: process.env.CLIENT_MAIL,
    CLIENT_PASSWORD: process.env.CLIENT_PASSWORD,
    MARKETING_MAIL: process.env.MARKETING_MAIL,
    SERVER_BASE_URL: process.env.SERVER_BASE_URL,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
    // Admin dashboard is a separate app from the public site; falls back to the
    // site URL only so nothing crashes when the var is unset.
    DASHBOARD_BASE_URL: (process.env.DASHBOARD_BASE_URL || process.env.CLIENT_BASE_URL),
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_DURATION: process.env.JWT_DURATION,
    DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
    DO_SPACES_KEY: process.env.DO_SPACES_KEY,
    DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
    DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    DO_SPACES_REGION: process.env.DO_SPACES_REGION,
    LOGIN_LIMIT: process.env.LOGIN_LIMIT,
    FILE_BASE_URL: process.env.FILE_BASE_URL,
    DEFAULT_AGENT_MAIL: process.env.DEFAULT_AGENT_MAIL,
    // Testing only: when set, every pottery tracking email is redirected to this
    // address instead of the customer's. Must be left unset in production.
    TRACKING_TEST_EMAIL: process.env.TRACKING_TEST_EMAIL,
};
exports.default = configKeys;
