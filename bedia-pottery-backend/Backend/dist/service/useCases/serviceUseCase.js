"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardCountsUseCase = exports.getServiceBySlugUseCase = exports.getServiceByIdUseCase = exports.deleteServiceByIdUseCase = exports.updateServiceByIdUseCase = exports.createServiceUseCase = exports.getAllServicesForAdminUseCase = exports.getAllServicesUseCase = void 0;
const serviceRepo_1 = require("../repos/serviceRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const careerRepo_1 = require("../../careers/repos/careerRepo");
const jobApplicationRepo_1 = require("../../careers/repos/jobApplicationRepo");
const serviceTypeRepo_1 = require("../../servicetype/repos/serviceTypeRepo");
const getAllServicesUseCase = async (queryParams) => {
    const { page = '1', search, serviceTypeId } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    if (serviceTypeId) {
        query.serviceTypeId = serviceTypeId;
    }
    const totalCount = await (0, serviceRepo_1.getServicesCount)(query);
    if (!totalCount)
        return { totalCount: 0, services: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const services = await (0, serviceRepo_1.fetchAllServices)(query, skip, parseInt(limit));
    return { totalCount, services };
};
exports.getAllServicesUseCase = getAllServicesUseCase;
const getAllServicesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, serviceRepo_1.getServicesCount)(query);
    if (!totalCount)
        return { totalCount: 0, services: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const services = await (0, serviceRepo_1.fetchAllServicesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, services };
};
exports.getAllServicesForAdminUseCase = getAllServicesForAdminUseCase;
const createServiceUseCase = async (data) => {
    // check for  unique value duplications
    const service = await (0, serviceRepo_1.createService)(data);
    if (!service) {
        throw new appError_1.default('Couldn\'t Create new Service. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createServiceUseCase = createServiceUseCase;
const updateServiceByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingService = await fetchServiceById(id);
        // check for  unique value updations
        const service = await (0, serviceRepo_1.updateServiceById)(id, data);
        if (!service)
            throw new appError_1.default('Couldn\'t update Service', httpStatus_1.HttpStatus.NOT_FOUND);
        return service;
    }
    throw new appError_1.default('No Service Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateServiceByIdUseCase = updateServiceByIdUseCase;
const deleteServiceByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const service = await (0, serviceRepo_1.deleteServiceById)(id);
        // check for  unique value updations
        if (service)
            return true;
    }
    throw new appError_1.default('No Service Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteServiceByIdUseCase = deleteServiceByIdUseCase;
const getServiceByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const service = await (0, serviceRepo_1.fetchServiceById)(query._id);
        if (service)
            return service;
    }
    throw new appError_1.default('No Service Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getServiceByIdUseCase = getServiceByIdUseCase;
const getServiceBySlugUseCase = async (query) => {
    if (query.slug) {
        const service = await (0, serviceRepo_1.fetchServiceBySlug)(query.slug);
        if (service)
            return service;
    }
    throw new appError_1.default('No Service Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getServiceBySlugUseCase = getServiceBySlugUseCase;
const getDashboardCountsUseCase = async () => {
    const query = { isDeleted: false };
    const [serviceTypeCount, serviceCount, careerCount, jobApplicationCount] = await Promise.all([
        (0, serviceTypeRepo_1.getServiceTypesCount)(query),
        (0, serviceRepo_1.getServicesCount)(query),
        (0, careerRepo_1.getCareersCount)(query),
        (0, jobApplicationRepo_1.getJobApplicationsCount)(query),
    ]);
    return {
        serviceTypes: serviceTypeCount,
        services: serviceCount,
        careers: careerCount,
        jobApplications: jobApplicationCount,
    };
};
exports.getDashboardCountsUseCase = getDashboardCountsUseCase;
