"use strict";
// import multer, { FileFilterCallback } from 'multer';
// import { Request } from 'express';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // Define MulterConfig class
// class MulterConfig {
//   // Storage configuration for multer
//   storage = multer.memoryStorage();
//   // File size limit (30 MB)
//   limits = { fileSize: 30 * 1024 * 1024 };
//   // File filter function to allow only specific mime types
//   fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     const allowedMimeTypes = [
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'image/webp',
//       'application/pdf',
//       'application/xml',
//       'text/xml',
//       'image/svg+xml',
//     ];
//     // Check if the file mimetype is allowed
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG, PNG, SVG images or PDF, XML documents are allowed.'));
//     }
//   };
//   // Dynamically handle single file upload with a dynamic field name
//   singleFileUpload(fieldName: string = 'file') {
//     return multer({
//       storage: this.storage,
//       limits: this.limits,
//       fileFilter: this.fileFilter,
//     }).single(fieldName); // Accept a single file with dynamic field name
//   }
//   // Dynamically handle multiple file upload with a dynamic field name
//   multipleFileUpload(fieldName: string = 'files', maxCount: number = 10) {
//     return multer({
//       storage: this.storage,
//       limits: this.limits,
//       fileFilter: this.fileFilter,
//     }).array(fieldName, maxCount); // Accept multiple files with dynamic field name
//   }
// }
// export default new MulterConfig();
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MulterConfig {
    constructor() {
        // Save files into /uploads
        this.storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path_1.default.join(__dirname, '../../uploads'));
            },
            filename: (req, file, cb) => {
                const uniqueName = Date.now() + '-' + file.originalname;
                cb(null, uniqueName);
            },
        });
        // Limit file size
        this.limits = { fileSize: 200 * 1024 * 1024 }; // 200MB
        // File filter (same as yours)
        this.fileFilter = (req, file, cb) => {
            const allowedMimeTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'image/svg+xml',
                'image/gif',
                'image/bmp',
                'image/tiff',
                'image/heic',
                'image/heif',
                'image/avif',
                'image/x-icon',
                'application/pdf',
                'application/xml',
                'text/xml',
                'image/svg+xml',
                'video/mp4',
                'video/mpeg',
                'video/quicktime', // .mov
                'video/x-msvideo', // .avi
                'video/x-matroska', // .mkv
            ];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Only images, PDF, XML, and video files are allowed.'));
            }
        };
        this.createUploadsFolder();
    }
    // Create /uploads folder if not exists
    createUploadsFolder() {
        const uploadPath = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
    }
    singleFileUpload(fieldName = 'file') {
        return (0, multer_1.default)({
            storage: this.storage,
            limits: this.limits,
            fileFilter: this.fileFilter,
        }).single(fieldName);
    }
    multipleFileUpload(fieldName = 'files', maxCount = 10) {
        return (0, multer_1.default)({
            storage: this.storage,
            limits: this.limits,
            fileFilter: this.fileFilter,
        }).array(fieldName, maxCount);
    }
}
exports.default = new MulterConfig();
