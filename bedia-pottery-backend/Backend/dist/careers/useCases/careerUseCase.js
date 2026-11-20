"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllJobApplicationsUseCase = exports.createJobApplicationUseCase = exports.getCareerMetaBySlugUseCase = exports.getCareerBySlugUseCase = exports.getCareerByIdUseCase = exports.deleteCareerByIdUseCase = exports.updateCareerByIdUseCase = exports.createCareerUseCase = exports.getAllCareersForAdminUseCase = exports.getAllCareersUseCase = void 0;
const careerRepo_1 = require("../repos/careerRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const jobApplicationRepo_1 = require("../repos/jobApplicationRepo");
// import { processAndUploadDocument } from '../../utils/documentUploader';
const digitalOceanSpaces_1 = require("../../utils/digitalOceanSpaces");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const getAllCareersUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { jobType: { $regex: search, $options: 'i' } },
            { workingHours: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, careerRepo_1.getCareersCount)(query);
    if (!totalCount)
        return { totalCount: 0, Careers: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const careers = await (0, careerRepo_1.fetchAllCareers)(query, skip, parseInt(limit));
    return { totalCount, careers };
};
exports.getAllCareersUseCase = getAllCareersUseCase;
const getAllCareersForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { jobType: { $regex: search, $options: 'i' } },
            { workingHours: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, careerRepo_1.getCareersCount)(query);
    if (!totalCount)
        return { totalCount: 0, Careers: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const careers = await (0, careerRepo_1.fetchAllCareersForAdmin)(query, skip, parseInt(limit));
    return { totalCount, careers };
};
exports.getAllCareersForAdminUseCase = getAllCareersForAdminUseCase;
const createCareerUseCase = async (data) => {
    // check for  unique value duplications
    const career = await (0, careerRepo_1.createCareer)(data);
    if (!career) {
        throw new appError_1.default('Couldn\'t Create new Career. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createCareerUseCase = createCareerUseCase;
const updateCareerByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingCareer = await fetchCareerById(id);
        // check for  unique value updations
        const career = await (0, careerRepo_1.updateCareerById)(id, data);
        if (!career)
            throw new appError_1.default('Couldn\'t update Career', httpStatus_1.HttpStatus.NOT_FOUND);
        return career;
    }
    throw new appError_1.default('No Career Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateCareerByIdUseCase = updateCareerByIdUseCase;
const deleteCareerByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const career = await (0, careerRepo_1.deleteCareerById)(id);
        // check for  unique value updations
        if (career)
            return true;
    }
    throw new appError_1.default('No Career Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteCareerByIdUseCase = deleteCareerByIdUseCase;
const getCareerByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const career = await (0, careerRepo_1.fetchCareerById)(query._id);
        if (career)
            return career;
    }
    throw new appError_1.default('No Career Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getCareerByIdUseCase = getCareerByIdUseCase;
const getCareerBySlugUseCase = async (slug) => {
    const career = await (0, careerRepo_1.fetchCareerBySlug)({ slug, isDeleted: false });
    if (career)
        return career;
    throw new appError_1.default('No Career Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getCareerBySlugUseCase = getCareerBySlugUseCase;
const getCareerMetaBySlugUseCase = async (slug) => {
    const career = await (0, careerRepo_1.fetchCareerMetaBySlug)({ slug, isDeleted: false });
    if (career)
        return career;
    throw new appError_1.default('No Career Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getCareerMetaBySlugUseCase = getCareerMetaBySlugUseCase;
const createJobApplicationUseCase = async (data, resumeFile) => {
    // check for  unique value duplications
    const { jobSlug, email } = data;
    const validJob = await (0, careerRepo_1.fetchCareerBySlug)({ slug: jobSlug, isDeleted: false });
    if (!validJob)
        throw new appError_1.default('Invalid Job Application. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    const alreadyApplied = await (0, jobApplicationRepo_1.fetchJobApplicationByEmail)({
        email,
        jobSlug,
        isDeleted: false,
    });
    if (alreadyApplied)
        throw new appError_1.default('You have already applied for this job.', httpStatus_1.HttpStatus.BAD_REQUEST);
    if (!['application/pdf'].includes(resumeFile.mimetype))
        throw new appError_1.default('Unsupported file type', httpStatus_1.HttpStatus.BAD_REQUEST);
    // const resume = await processAndUploadDocument('resume', resumeFile);
    const filePath = 'uploads/resume/' + (0, uuid_1.v4)() + path_1.default.extname(resumeFile.originalname);
    await (0, digitalOceanSpaces_1.uploadFile)(resumeFile.buffer, filePath, resumeFile.mimetype);
    if (!filePath)
        throw new appError_1.default('File upload failed.Please try again', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    const jobApplication = await (0, jobApplicationRepo_1.createJobApplication)({ ...data, resume: `/${filePath}` });
    if (!jobApplication) {
        throw new appError_1.default('Couldn\'t Create new job application. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createJobApplicationUseCase = createJobApplicationUseCase;
// export const createJobApplicationUseCase = async (
//   data: IJobApplicationBody,
// ): Promise<boolean> => {
//   // check for  unique value duplications
//   const { jobSlug, email } = data;
//   const validJob = await fetchCareerBySlug({ slug: jobSlug, isDeleted: false });
//   if (!validJob) throw new AppError('Invalid Job Application. Try again', HttpStatus.BAD_REQUEST);
//   const alreadyApplied = await fetchJobApplicationByEmail({
//     email,
//     jobSlug,
//     isDeleted: false,
//   });
//   if (alreadyApplied)
//     throw new AppError('You have already applied for this job.', HttpStatus.BAD_REQUEST);
//   const jobApplication = await createJobApplication(data);
//   if (!jobApplication) {
//     throw new AppError('Couldn\'t Create new job application. Try again', HttpStatus.BAD_REQUEST);
//   }
//   return true;
// };
const getAllJobApplicationsUseCase = async (queryParams) => {
    const { page = '1', search, jobSlug } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (jobSlug) {
        query.jobSlug = jobSlug;
    }
    if (search && search.length > 0) {
        query['$or'] = [
            { applicantName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { jobTitle: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, jobApplicationRepo_1.getJobApplicationsCount)(query);
    if (!totalCount)
        return { totalCount: 0, jobApplications: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobApplications = await (0, jobApplicationRepo_1.fetchAllJobApplications)(query, skip, parseInt(limit));
    return { totalCount, jobApplications };
};
exports.getAllJobApplicationsUseCase = getAllJobApplicationsUseCase;
