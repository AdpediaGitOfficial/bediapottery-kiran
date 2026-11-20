"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalleryByIdUseCase = exports.deleteGalleryByIdUseCase = exports.updateGalleryByIdUseCase = exports.createGalleryUseCase = exports.getAllGalleriesForAdminUseCase = exports.getAllGalleriesUseCase = void 0;
const galleryRepo_1 = require("../repos/galleryRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllGalleriesUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, galleryRepo_1.getGalleriesCount)(query);
    if (!totalCount)
        return { totalCount: 0, galleries: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const galleries = await (0, galleryRepo_1.fetchAllGalleries)(query, skip, parseInt(limit));
    return { totalCount, galleries };
};
exports.getAllGalleriesUseCase = getAllGalleriesUseCase;
const getAllGalleriesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const totalCount = await (0, galleryRepo_1.getGalleriesCount)(query);
    if (!totalCount)
        return { totalCount: 0, galleries: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const galleries = await (0, galleryRepo_1.fetchAllGalleriesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, galleries };
};
exports.getAllGalleriesForAdminUseCase = getAllGalleriesForAdminUseCase;
const createGalleryUseCase = async (data) => {
    // check for  unique value duplications
    const gallery = await (0, galleryRepo_1.createGallery)(data);
    if (!gallery) {
        throw new appError_1.default('Couldn\'t Create new Gallery. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createGalleryUseCase = createGalleryUseCase;
const updateGalleryByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingGallery = await fetchGalleryById(id);
        // check for  unique value updations
        const gallery = await (0, galleryRepo_1.updateGalleryById)(id, data);
        if (!gallery)
            throw new appError_1.default('Couldn\'t update Gallery', httpStatus_1.HttpStatus.NOT_FOUND);
        return gallery;
    }
    throw new appError_1.default('No Gallery Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateGalleryByIdUseCase = updateGalleryByIdUseCase;
const deleteGalleryByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const gallery = await (0, galleryRepo_1.deleteGalleryById)(id);
        // check for  unique value updations
        if (gallery)
            return true;
    }
    throw new appError_1.default('No Gallery Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteGalleryByIdUseCase = deleteGalleryByIdUseCase;
const getGalleryByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const gallery = await (0, galleryRepo_1.fetchGalleryById)(query._id);
        if (gallery)
            return gallery;
    }
    throw new appError_1.default('No Gallery Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getGalleryByIdUseCase = getGalleryByIdUseCase;
