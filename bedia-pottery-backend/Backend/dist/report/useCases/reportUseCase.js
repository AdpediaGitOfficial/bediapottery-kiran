"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportUseCase = exports.uploadReportUseCase = void 0;
// import { processAndUploadDocument } from '../../utils/documentUploader';
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const reportRepo_1 = require("../repos/reportRepo");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const digitalOceanSpaces_1 = require("../../utils/digitalOceanSpaces");
const uploadReportUseCase = async (file) => {
    if (!['application/pdf'].includes(file[0].mimetype))
        throw new appError_1.default('Unsupported file type', httpStatus_1.HttpStatus.BAD_REQUEST);
    const fileName = 'uploads/reports/' + (0, uuid_1.v4)() + path_1.default.extname(file[0].originalname);
    await (0, digitalOceanSpaces_1.uploadFile)(file[0].buffer, fileName, file[0].mimetype);
    // const documentUrl = await processAndUploadDocument('reports', file[0]);
    // if (!documentUrl)
    //   throw new AppError('File upload failed.Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    await (0, reportRepo_1.createReport)(`/${fileName}`);
    return `/${fileName}`;
};
exports.uploadReportUseCase = uploadReportUseCase;
const getReportUseCase = async () => {
    const report = await (0, reportRepo_1.fetchLatestReport)();
    if (report)
        return report;
    throw new appError_1.default('Report not found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getReportUseCase = getReportUseCase;
