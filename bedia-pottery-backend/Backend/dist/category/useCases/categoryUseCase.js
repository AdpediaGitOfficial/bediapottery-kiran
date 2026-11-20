"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryByIdUseCase = exports.deleteCategoryByIdUseCase = exports.updateCategoryByIdUseCase = exports.createCategoryUseCase = exports.getAllCategoriesForAdminUseCase = exports.getAllCategoriesUseCase = void 0;
const categoryRepo_1 = require("../repos/categoryRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllCategoriesUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, categoryRepo_1.getCategoriesCount)(query);
    if (!totalCount)
        return { totalCount: 0, categories: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const categories = await (0, categoryRepo_1.fetchAllCategories)(query, skip, parseInt(limit));
    return { totalCount, categories };
};
exports.getAllCategoriesUseCase = getAllCategoriesUseCase;
const getAllCategoriesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, categoryRepo_1.getCategoriesCount)(query);
    if (!totalCount)
        return { totalCount: 0, categories: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const categories = await (0, categoryRepo_1.fetchAllCategoriesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, categories };
};
exports.getAllCategoriesForAdminUseCase = getAllCategoriesForAdminUseCase;
const createCategoryUseCase = async (data) => {
    // check for  unique value duplications
    const category = await (0, categoryRepo_1.createCategory)(data);
    if (!category) {
        throw new appError_1.default('Couldn\'t Create new Category. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createCategoryUseCase = createCategoryUseCase;
const updateCategoryByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingCategory = await fetchCategoryById(id);
        // check for  unique value updations
        const category = await (0, categoryRepo_1.updateCategoryById)(id, data);
        if (!category)
            throw new appError_1.default('Couldn\'t update Category', httpStatus_1.HttpStatus.NOT_FOUND);
        return category;
    }
    throw new appError_1.default('No Category Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateCategoryByIdUseCase = updateCategoryByIdUseCase;
// export const deleteCategoryByIdUseCase = async (id: string): Promise<boolean> => {
//   if (ObjectID(id)) {
//     const category = await deleteCategoryById(id);
//     // check for  unique value updations
//     if (category) return true;
//   }
//   throw new AppError('No Category Found', HttpStatus.NOT_FOUND);
// };
const deleteCategoryByIdUseCase = async (id) => {
    if (!(0, objectIdParser_1.ObjectID)(id)) {
        throw new appError_1.default('Invalid Category ID', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const hasChildren = await (0, categoryRepo_1.hasChildCategories)(id);
    if (hasChildren) {
        throw new appError_1.default('Cannot delete. This category has sub-categories.', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    //Delete if no children
    const category = await (0, categoryRepo_1.deleteCategoryById)(id);
    if (category)
        return true;
    throw new appError_1.default('No Category Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteCategoryByIdUseCase = deleteCategoryByIdUseCase;
const getCategoryByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const category = await (0, categoryRepo_1.fetchCategoryById)(query._id);
        if (category)
            return category;
    }
    throw new appError_1.default('No Category Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getCategoryByIdUseCase = getCategoryByIdUseCase;
