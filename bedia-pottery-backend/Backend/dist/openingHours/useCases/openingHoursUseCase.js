"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpeningHoursByIdUseCase = exports.deleteOpeningHoursByIdUseCase = exports.updateOpeningHoursByIdUseCase = exports.createOpeningHoursUseCase = exports.getAllOpeningHoursForAdminUseCase = exports.getAllOpeningHoursUseCase = void 0;
const openingHoursRepo_1 = require("../repos/openingHoursRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllOpeningHoursUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, openingHoursRepo_1.getOpeningHoursCount)(query);
    if (!totalCount)
        return { totalCount: 0, openingHours: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const openingHours = await (0, openingHoursRepo_1.fetchAllOpeningHours)(query, skip, parseInt(limit));
    return { totalCount, openingHours };
};
exports.getAllOpeningHoursUseCase = getAllOpeningHoursUseCase;
const getAllOpeningHoursForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, openingHoursRepo_1.getOpeningHoursCount)(query);
    if (!totalCount)
        return { totalCount: 0, openingHours: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const openingHours = await (0, openingHoursRepo_1.fetchAllOpeningHoursForAdmin)(query, skip, parseInt(limit));
    return { totalCount, openingHours };
};
exports.getAllOpeningHoursForAdminUseCase = getAllOpeningHoursForAdminUseCase;
const createOpeningHoursUseCase = async (data) => {
    // check for  unique value duplications
    const openingHours = await (0, openingHoursRepo_1.createOpeningHours)(data);
    if (!openingHours) {
        throw new appError_1.default('Couldn\'t Create new OpeningHours. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createOpeningHoursUseCase = createOpeningHoursUseCase;
const updateOpeningHoursByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingOpeningHours = await fetchOpeningHoursById(id);
        // check for  unique value updations
        const openingHours = await (0, openingHoursRepo_1.updateOpeningHoursById)(id, data);
        if (!openingHours)
            throw new appError_1.default('Couldn\'t update OpeningHours', httpStatus_1.HttpStatus.NOT_FOUND);
        return openingHours;
    }
    throw new appError_1.default('No OpeningHours Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateOpeningHoursByIdUseCase = updateOpeningHoursByIdUseCase;
const deleteOpeningHoursByIdUseCase = async (id) => {
    if (!(0, objectIdParser_1.ObjectID)(id)) {
        throw new appError_1.default('Invalid OpeningHours ID', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const openingHours = await (0, openingHoursRepo_1.deleteOpeningHoursById)(id);
    if (openingHours)
        return true;
    throw new appError_1.default('No OpeningHours Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteOpeningHoursByIdUseCase = deleteOpeningHoursByIdUseCase;
const getOpeningHoursByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const openingHours = await (0, openingHoursRepo_1.fetchOpeningHoursById)(query._id);
        if (openingHours)
            return openingHours;
    }
    throw new appError_1.default('No OpeningHours Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getOpeningHoursByIdUseCase = getOpeningHoursByIdUseCase;
