"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageMetaByUrlUseCase = exports.getPageMetaByIdUseCase = exports.deletePageMetaByIdUseCase = exports.updatePageMetaByIdUseCase = exports.createPageMetaUseCase = exports.getAllPageMetasForAdminUseCase = void 0;
const pageMetaRepo_1 = require("../repos/pageMetaRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllPageMetasForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { description: { $regex: search, $options: 'i' } },
            { keywords: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, pageMetaRepo_1.getPageMetasCount)(query);
    if (!totalCount)
        return { totalCount: 0, metaDatas: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const metaDatas = await (0, pageMetaRepo_1.fetchAllPageMetasForAdmin)(query, skip, parseInt(limit));
    return { totalCount, metaDatas };
};
exports.getAllPageMetasForAdminUseCase = getAllPageMetasForAdminUseCase;
const createPageMetaUseCase = async (data) => {
    // check for  unique value duplications
    const metaData = await (0, pageMetaRepo_1.createPageMeta)(data);
    if (!metaData) {
        throw new appError_1.default('Couldn\'t Create new meta data. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createPageMetaUseCase = createPageMetaUseCase;
const updatePageMetaByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingPageMeta = await fetchPageMetaById(id);
        // check for  unique value updations
        const metaData = await (0, pageMetaRepo_1.updatePageMetaById)(id, data);
        if (!metaData)
            throw new appError_1.default('Couldn\'t update PageMeta', httpStatus_1.HttpStatus.NOT_FOUND);
        return metaData;
    }
    throw new appError_1.default('No meta data Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updatePageMetaByIdUseCase = updatePageMetaByIdUseCase;
const deletePageMetaByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const metaData = await (0, pageMetaRepo_1.deletePageMetaById)(id);
        // check for  unique value updations
        if (metaData)
            return true;
    }
    throw new appError_1.default('No meta data Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deletePageMetaByIdUseCase = deletePageMetaByIdUseCase;
const getPageMetaByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const metaData = await (0, pageMetaRepo_1.fetchPageMetaById)(query._id);
        if (metaData)
            return metaData;
    }
    throw new appError_1.default('No meta data Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getPageMetaByIdUseCase = getPageMetaByIdUseCase;
const getPageMetaByUrlUseCase = async (url) => {
    const metaData = await (0, pageMetaRepo_1.fetchPageMetaByUrl)({ url, isDeleted: false });
    if (metaData)
        return metaData;
    throw new appError_1.default('No meta data Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getPageMetaByUrlUseCase = getPageMetaByUrlUseCase;
