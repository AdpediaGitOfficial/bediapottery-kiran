"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrochureByIdUseCase = exports.deleteBrochureByIdUseCase = exports.updateBrochureByIdUseCase = exports.createBrochureUseCase = exports.getAllBrochuresForAdminUseCase = exports.getAllBrochuresUseCase = void 0;
const brochureRepo_1 = require("../repos/brochureRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllBrochuresUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, brochureRepo_1.getBrochuresCount)(query);
    if (!totalCount)
        return { totalCount: 0, brochures: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const brochures = await (0, brochureRepo_1.fetchAllBrochures)(query, skip, parseInt(limit));
    return { totalCount, brochures };
};
exports.getAllBrochuresUseCase = getAllBrochuresUseCase;
const getAllBrochuresForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, brochureRepo_1.getBrochuresCount)(query);
    if (!totalCount)
        return { totalCount: 0, brochures: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const brochures = await (0, brochureRepo_1.fetchAllBrochuresForAdmin)(query, skip, parseInt(limit));
    return { totalCount, brochures };
};
exports.getAllBrochuresForAdminUseCase = getAllBrochuresForAdminUseCase;
const createBrochureUseCase = async (data) => {
    // check for  unique value duplications
    const brochure = await (0, brochureRepo_1.createBrochure)(data);
    if (!brochure) {
        throw new appError_1.default('Couldn\'t Create new Brochure. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createBrochureUseCase = createBrochureUseCase;
const updateBrochureByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingBrochure = await fetchBrochureById(id);
        // check for  unique value updations
        const brochure = await (0, brochureRepo_1.updateBrochureById)(id, data);
        if (!brochure)
            throw new appError_1.default('Couldn\'t update Brochure', httpStatus_1.HttpStatus.NOT_FOUND);
        return brochure;
    }
    throw new appError_1.default('No Brochure Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateBrochureByIdUseCase = updateBrochureByIdUseCase;
const deleteBrochureByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const brochure = await (0, brochureRepo_1.deleteBrochureById)(id);
        // check for  unique value updations
        if (brochure)
            return true;
    }
    throw new appError_1.default('No Brochure Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteBrochureByIdUseCase = deleteBrochureByIdUseCase;
const getBrochureByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const brochure = await (0, brochureRepo_1.fetchBrochureById)(query._id);
        if (brochure)
            return brochure;
    }
    throw new appError_1.default('No Brochure Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getBrochureByIdUseCase = getBrochureByIdUseCase;
