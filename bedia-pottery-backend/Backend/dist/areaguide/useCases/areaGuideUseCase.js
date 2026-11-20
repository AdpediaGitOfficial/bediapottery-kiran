"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAreaGuideByNameUseCase = exports.getAreaGuideMetaBySlugUseCase = exports.getAreaGuideBySlugUseCase = exports.getAreaGuideByIdUseCase = exports.deleteAreaGuideByIdUseCase = exports.updateAreaGuideByIdUseCase = exports.createAreaGuideUseCase = exports.getAllAreaGuidesForAdminUseCase = exports.getAllAreaGuidesUseCase = void 0;
const areaGuideRepo_1 = require("../repos/areaGuideRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllAreaGuidesUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, areaGuideRepo_1.getAreaGuidesCount)(query);
    if (!totalCount)
        return { totalCount: 0, areaGuides: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const areaGuides = await (0, areaGuideRepo_1.fetchAllAreaGuides)(query, skip, parseInt(limit));
    return { totalCount, areaGuides };
};
exports.getAllAreaGuidesUseCase = getAllAreaGuidesUseCase;
const getAllAreaGuidesForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, areaGuideRepo_1.getAreaGuidesCount)(query);
    if (!totalCount)
        return { totalCount: 0, areaGuides: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const areaGuides = await (0, areaGuideRepo_1.fetchAllAreaGuidesForAdmin)(query, skip, parseInt(limit));
    return { totalCount, areaGuides };
};
exports.getAllAreaGuidesForAdminUseCase = getAllAreaGuidesForAdminUseCase;
const createAreaGuideUseCase = async (data) => {
    // check for  unique value duplications
    const areaGuide = await (0, areaGuideRepo_1.createAreaGuide)(data);
    if (!areaGuide) {
        throw new appError_1.default('Couldn\'t Create new area guide. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createAreaGuideUseCase = createAreaGuideUseCase;
const updateAreaGuideByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingAreaGuide = await fetchAreaGuideById(id);
        // check for  unique value updations
        const areaGuide = await (0, areaGuideRepo_1.updateAreaGuideById)(id, data);
        if (!areaGuide)
            throw new appError_1.default('Couldn\'t update area guide', httpStatus_1.HttpStatus.NOT_FOUND);
        return areaGuide;
    }
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateAreaGuideByIdUseCase = updateAreaGuideByIdUseCase;
const deleteAreaGuideByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const areaGuide = await (0, areaGuideRepo_1.deleteAreaGuideById)(id);
        // check for  unique value updations
        if (areaGuide)
            return true;
    }
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteAreaGuideByIdUseCase = deleteAreaGuideByIdUseCase;
const getAreaGuideByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const areaGuide = await (0, areaGuideRepo_1.fetchAreaGuideById)(query._id);
        if (areaGuide)
            return areaGuide;
    }
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAreaGuideByIdUseCase = getAreaGuideByIdUseCase;
const getAreaGuideBySlugUseCase = async (query) => {
    const areaGuide = await (0, areaGuideRepo_1.fetchAreaGuideBySlug)(query.slug);
    if (areaGuide)
        return areaGuide;
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAreaGuideBySlugUseCase = getAreaGuideBySlugUseCase;
const getAreaGuideMetaBySlugUseCase = async (query) => {
    const areaGuide = await (0, areaGuideRepo_1.fetchAreaGuideMetaBySlug)(query.slug);
    if (areaGuide)
        return areaGuide;
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAreaGuideMetaBySlugUseCase = getAreaGuideMetaBySlugUseCase;
const getAreaGuideByNameUseCase = async (query) => {
    const areaGuide = await (0, areaGuideRepo_1.fetchAreaGuideByName)(query.name);
    if (areaGuide)
        return areaGuide;
    throw new appError_1.default('No area guide found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAreaGuideByNameUseCase = getAreaGuideByNameUseCase;
