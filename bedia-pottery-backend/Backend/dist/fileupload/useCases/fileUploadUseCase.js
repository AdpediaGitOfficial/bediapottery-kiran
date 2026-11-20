"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUploadedFileUseCase = exports.uploadFileUseCase = void 0;
// import path from 'path';
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
// import configKeys from '../../configKeys';
// import { processAndUploadDocument } from '../../utils/documentUploader';
const imageUploader_1 = require("../../utils/imageUploader");
// import { promises as fs } from 'fs';
const logger_1 = __importDefault(require("../../config/logger"));
const digitalOceanSpaces_1 = require("../../utils/digitalOceanSpaces");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const uploadFileUseCase = async (files, location, watermark) => {
    const uploads = [];
    for (const file of files) {
        if (![
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
            'image/webp',
            'image/jpeg',
            'image/svg+xml',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'image/heic',
            'image/heif',
            'image/avif',
            'image/x-icon',
        ].includes(file.mimetype)) {
            throw new appError_1.default('Unsupported file type', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        // if (file.size > 2 * 1024 * 1024) {
        //   throw new AppError('file size exceeded', HttpStatus.BAD_REQUEST);
        // }
        // if (
        //   ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/jpeg'].includes(file.mimetype)
        // ) {
        //   const imageUrl = await processAndUploadImage(location, file, watermark);
        //   if (!imageUrl) throw new AppError('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
        //   uploads.push(imageUrl);
        // }
        // if (['application/pdf'].includes(file.mimetype)) {
        //   const documentUrl = await processAndUploadDocument(location, file);
        //   if (!documentUrl) throw new AppError('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
        //   uploads.push(documentUrl);
        // }
        let fileBuffer = file.buffer;
        if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/jpeg'].includes(file.mimetype) &&
            watermark === true) {
            fileBuffer = await (0, imageUploader_1.addWatermark)(file.buffer);
        }
        const fileName = `uploads/${location}/` + (0, uuid_1.v4)() + path_1.default.extname(file.originalname);
        await (0, digitalOceanSpaces_1.uploadFile)(fileBuffer, fileName, file.mimetype);
        uploads.push(`/${fileName}`);
    }
    return uploads;
};
exports.uploadFileUseCase = uploadFileUseCase;
const removeUploadedFileUseCase = async (location) => {
    // const absolutePath = path.resolve(location);
    try {
        // await fs.rm(path.join(configKeys.BASE_DIR_PATH, location));
        // Extract file name from the URL
        // const urlParts = location.split('/');
        // const fileName = urlParts.slice(3).join('/'); // Get everything after the bucket's region and space name
        // if (!fileName) {
        //   throw new AppError('File not found', HttpStatus.NOT_FOUND);
        // }
        // Delete the file from DigitalOcean Space
        await (0, digitalOceanSpaces_1.deleteFile)(location);
        return true;
    }
    catch (error) {
        // if (error.code === 'ENOENT') {
        //   // ENOENT means no such file or directory
        //   throw new AppError('File not found', HttpStatus.NOT_FOUND);
        // } else {
        logger_1.default.info({ error });
        throw new appError_1.default('Error deleting file', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
        // }
    }
};
exports.removeUploadedFileUseCase = removeUploadedFileUseCase;
