"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUploadedFile = exports.uploadFile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fileUploadUseCase_1 = require("../useCases/fileUploadUseCase");
//import { removeUploadedFileUseCase, uploadFileUseCase } from '../useCases/fileUploadUseCase';
// export const uploadFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//   if (!req.files || req.files.length === 0) {
//     res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
//   } else {
//     const { location } = req.query as { location: string };
//     const watermark = req.query.watermark === 'true' ? true : false;
//     if (!location) {
//       throw new Error('location is required');
//     }
//     const imageUrl = await uploadFileUseCase(
//       req.files as Express.Multer.File[],
//       location,
//       watermark,
//     );
//     res.status(201).json({
//       status: 'success',
//       message: 'file uploaded successfully',
//       result: imageUrl,
//     });
//   }
// });
exports.uploadFile = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
    }
    const { location } = req.query;
    if (!location) {
        throw new Error('location is required');
    }
    const files = req.files;
    const urls = files.map((file) => {
        return `${process.env.BASE_URL}/uploads/${file.filename}`;
    });
    res.status(201).json({
        status: 'success',
        message: 'file uploaded successfully',
        result: urls,
    });
});
exports.removeUploadedFile = (0, express_async_handler_1.default)(async (req, res) => {
    const { location } = req.query;
    if (!location) {
        throw new Error('location is required');
    }
    if (!location.startsWith('/uploads')) {
        res.status(403).json({
            message: 'Permission denied. You can only delete files from the uploads directory.',
        });
    }
    else {
        await (0, fileUploadUseCase_1.removeUploadedFileUseCase)(location);
        res.status(200).json({
            status: 'success',
            message: 'file removed successfully',
            result: true,
        });
    }
});
