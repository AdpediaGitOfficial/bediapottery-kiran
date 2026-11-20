"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareerFooterByIdUseCase = exports.deleteCareerFooterByIdUseCase = exports.updateCareerFooterByIdUseCase = exports.createCareerFooterUseCase = exports.getAllCareerFootersForAdminUseCase = exports.getAllCareerFootersUseCase = void 0;
const careerFooterRepo_1 = require("../repos/careerFooterRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllCareerFootersUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, careerFooterRepo_1.getCareerFootersCount)(query);
    if (!totalCount)
        return { totalCount: 0, careerFooters: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const careerFooters = await (0, careerFooterRepo_1.fetchAllCareerFooters)(query, skip, parseInt(limit));
    return { totalCount, careerFooters };
};
exports.getAllCareerFootersUseCase = getAllCareerFootersUseCase;
const getAllCareerFootersForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, careerFooterRepo_1.getCareerFootersCount)(query);
    if (!totalCount)
        return { totalCount: 0, careerFooters: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const careerFooters = await (0, careerFooterRepo_1.fetchAllCareerFootersForAdmin)(query, skip, parseInt(limit));
    return { totalCount, careerFooters };
};
exports.getAllCareerFootersForAdminUseCase = getAllCareerFootersForAdminUseCase;
const createCareerFooterUseCase = async (data) => {
    // check for  unique value duplications
    const careerFooter = await (0, careerFooterRepo_1.createCareerFooter)(data);
    if (!careerFooter) {
        throw new appError_1.default('Couldn\'t Create new CareerFooter. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createCareerFooterUseCase = createCareerFooterUseCase;
const updateCareerFooterByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingCareerFooter = await fetchCareerFooterById(id);
        // check for  unique value updations
        const careerFooter = await (0, careerFooterRepo_1.updateCareerFooterById)(id, data);
        if (!careerFooter)
            throw new appError_1.default('Couldn\'t update CareerFooter', httpStatus_1.HttpStatus.NOT_FOUND);
        return careerFooter;
    }
    throw new appError_1.default('No CareerFooter Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateCareerFooterByIdUseCase = updateCareerFooterByIdUseCase;
const deleteCareerFooterByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const careerFooter = await (0, careerFooterRepo_1.deleteCareerFooterById)(id);
        // check for  unique value updations
        if (careerFooter)
            return true;
    }
    throw new appError_1.default('No CareerFooter Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteCareerFooterByIdUseCase = deleteCareerFooterByIdUseCase;
const getCareerFooterByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const careerFooter = await (0, careerFooterRepo_1.fetchCareerFooterById)(query._id);
        if (careerFooter)
            return careerFooter;
    }
    throw new appError_1.default('No CareerFooter Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getCareerFooterByIdUseCase = getCareerFooterByIdUseCase;
