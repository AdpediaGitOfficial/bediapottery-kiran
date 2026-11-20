"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClayTypeByIdUseCase = exports.deleteClayTypeByIdUseCase = exports.updateClayTypeByIdUseCase = exports.createClayTypeUseCase = exports.getAllClayTypesForAdminUseCase = exports.getAllClayTypesUseCase = void 0;
const clayTypeRepo_1 = require("../repos/clayTypeRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllClayTypesUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, clayTypeRepo_1.getClayTypesCount)(query);
    if (!totalCount)
        return { totalCount: 0, clayTypes: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clayTypes = await (0, clayTypeRepo_1.fetchAllClayTypes)(query, skip, parseInt(limit));
    return { totalCount, clayTypes };
};
exports.getAllClayTypesUseCase = getAllClayTypesUseCase;
const getAllClayTypesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, clayTypeRepo_1.getClayTypesCount)(query);
    if (!totalCount)
        return { totalCount: 0, clayTypes: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clayTypes = await (0, clayTypeRepo_1.fetchAllClayTypesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, clayTypes };
};
exports.getAllClayTypesForAdminUseCase = getAllClayTypesForAdminUseCase;
const createClayTypeUseCase = async (data) => {
    // check for  unique value duplications
    const clayType = await (0, clayTypeRepo_1.createClayType)(data);
    if (!clayType) {
        throw new appError_1.default('Couldn\'t Create new ClayType. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createClayTypeUseCase = createClayTypeUseCase;
const updateClayTypeByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingClayType = await fetchClayTypeById(id);
        // check for  unique value updations
        const clayType = await (0, clayTypeRepo_1.updateClayTypeById)(id, data);
        if (!clayType)
            throw new appError_1.default('Couldn\'t update ClayType', httpStatus_1.HttpStatus.NOT_FOUND);
        return clayType;
    }
    throw new appError_1.default('No ClayType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateClayTypeByIdUseCase = updateClayTypeByIdUseCase;
// export const deleteClayTypeByIdUseCase = async (id: string): Promise<boolean> => {
//   if (ObjectID(id)) {
//     const clayType = await deleteClayTypeById(id);
//     // check for  unique value updations
//     if (clayType) return true;
//   }
//   throw new AppError('No ClayType Found', HttpStatus.NOT_FOUND);
// };
const deleteClayTypeByIdUseCase = async (id) => {
    if (!(0, objectIdParser_1.ObjectID)(id)) {
        throw new appError_1.default('Invalid ClayType ID', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const clayType = await (0, clayTypeRepo_1.deleteClayTypeById)(id);
    if (clayType)
        return true;
    throw new appError_1.default('No ClayType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteClayTypeByIdUseCase = deleteClayTypeByIdUseCase;
const getClayTypeByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const clayType = await (0, clayTypeRepo_1.fetchClayTypeById)(query._id);
        if (clayType)
            return clayType;
    }
    throw new appError_1.default('No ClayType Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getClayTypeByIdUseCase = getClayTypeByIdUseCase;
