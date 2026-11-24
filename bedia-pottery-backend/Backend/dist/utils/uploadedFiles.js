"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveUploadedFiles = void 0;
const express_1 = __importDefault(require("express"));
/**
 * Serves the files uploaded from the dashboard. multer saves them in `uploads/`
 * next to `dist/`, while the API's own static folder is `dist/uploads/`, so
 * without this every new upload answered 404.
 *
 * Only files directly in the folder are served. Its sub-folders hold files that
 * are not public (the generated gift vouchers, whose names can be guessed, and
 * the voucher templates), so any path that goes into one — written plainly or
 * with an encoded slash — falls through and answers 404.
 */
const serveUploadedFiles = (directory) => {
    const files = express_1.default.static(directory, { index: false, redirect: false, dotfiles: 'deny' });
    return (req, res, next) => {
        let name;
        try {
            name = decodeURIComponent(req.path.slice(1));
        }
        catch {
            return next();
        }
        if (!name || /[\\/]/.test(name))
            return next();
        return files(req, res, next);
    };
};
exports.serveUploadedFiles = serveUploadedFiles;
