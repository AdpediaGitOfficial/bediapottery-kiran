"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndUploadDocument = processAndUploadDocument;
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const configKeys_1 = __importDefault(require("../configKeys"));
async function processAndUploadDocument(location, file) {
    // Generate a unique filename
    const filename = (0, uuid_1.v4)() + '.pdf';
    const filePath = path_1.default.join(configKeys_1.default.BASE_DIR_PATH, 'uploads', location, filename);
    // Ensure the directory exists
    await fs_1.promises.mkdir(path_1.default.dirname(filePath), { recursive: true });
    // Save the file to the local directory
    await fs_1.promises.writeFile(filePath, file.buffer);
    // Return the file path or a URL to access the file
    return `/uploads/${location}/${filename}`;
}
