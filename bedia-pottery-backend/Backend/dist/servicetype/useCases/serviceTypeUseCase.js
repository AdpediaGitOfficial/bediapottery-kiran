"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTypeByIdUseCase = exports.deleteServiceTypeByIdUseCase = exports.updateServiceTypeByIdUseCase = exports.createServiceTypeUseCase = exports.getAllServiceTypesForAdminUseCase = exports.getAllServiceTypesUseCase = void 0;
const serviceTypeRepo_1 = require("../repos/serviceTypeRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllServiceTypesUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, serviceTypeRepo_1.getServiceTypesCount)(query);
    if (!totalCount)
        return { totalCount: 0, serviceTypes: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const serviceTypes = await (0, serviceTypeRepo_1.fetchAllServiceTypes)(query, skip, parseInt(limit));
    return { totalCount, serviceTypes };
};
exports.getAllServiceTypesUseCase = getAllServiceTypesUseCase;
const getAllServiceTypesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, serviceTypeRepo_1.getServiceTypesCount)(query);
    if (!totalCount)
        return { totalCount: 0, serviceTypes: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const serviceTypes = await (0, serviceTypeRepo_1.fetchAllServiceTypesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, serviceTypes };
};
exports.getAllServiceTypesForAdminUseCase = getAllServiceTypesForAdminUseCase;
const createServiceTypeUseCase = async (data) => {
    // check for  unique value duplications
    const serviceType = await (0, serviceTypeRepo_1.createServiceType)(data);
    if (!serviceType) {
        throw new appError_1.default('Couldn\'t Create new ServiceType. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createServiceTypeUseCase = createServiceTypeUseCase;
const updateServiceTypeByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingServiceType = await fetchServiceTypeById(id);
        // check for  unique value updations
        const serviceType = await (0, serviceTypeRepo_1.updateServiceTypeById)(id, data);
        if (!serviceType)
            throw new appError_1.default('Couldn\'t update ServiceType', httpStatus_1.HttpStatus.NOT_FOUND);
        return serviceType;
    }
    throw new appError_1.default('No ServiceType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateServiceTypeByIdUseCase = updateServiceTypeByIdUseCase;
const deleteServiceTypeByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const serviceType = await (0, serviceTypeRepo_1.deleteServiceTypeById)(id);
        // check for  unique value updations
        if (serviceType)
            return true;
    }
    throw new appError_1.default('No ServiceType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteServiceTypeByIdUseCase = deleteServiceTypeByIdUseCase;
const getServiceTypeByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const serviceType = await (0, serviceTypeRepo_1.fetchServiceTypeById)(query._id);
        if (serviceType)
            return serviceType;
    }
    throw new appError_1.default('No ServiceType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getServiceTypeByIdUseCase = getServiceTypeByIdUseCase;
