"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeaturedOffPlanUseCase = exports.getOffPlanMetaBySlugUseCase = exports.getOffPlanBySlugUseCase = exports.getOffPlanByIdUseCase = exports.deleteOffPlanByIdUseCase = exports.updateOffPlanByIdUseCase = exports.getKeywordsListUseCase = exports.getOffPlansByFilterUseCase = exports.createOffPlanUseCase = exports.getAllExclusiveOffPlansUseCase = exports.getAllOffPlansForAdminUseCase = exports.getAllOffPlansUseCase = void 0;
const offPlanPropertyRepo_1 = require("../repos/offPlanPropertyRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllOffPlansUseCase = async (queryParams) => {
    const { page = '1', search, sortBy, order = 'desc', featured } = queryParams;
    const { limit = '10' } = queryParams;
    // Sorting
    const sortCriteria = {};
    sortCriteria[sortBy || 'updatedAt'] = order === 'asc' ? 1 : -1;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } },
            { developer: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
        ];
    }
    if (featured === 'true') {
        query['isLuxury'] = true;
    }
    const totalCount = await (0, offPlanPropertyRepo_1.getOffPlanPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, offPlanProperties: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const offPlanProperties = await (0, offPlanPropertyRepo_1.fetchAllOffPlanProperties)(query, skip, parseInt(limit), sortCriteria);
    return { totalCount, offPlanProperties };
};
exports.getAllOffPlansUseCase = getAllOffPlansUseCase;
const getAllOffPlansForAdminUseCase = async (queryParams) => {
    const { page = '1', search, sortBy, order = 'desc' } = queryParams;
    const { limit = '10' } = queryParams;
    // Sorting
    const sortCriteria = {};
    sortCriteria[sortBy || 'updatedAt'] = order === 'asc' ? 1 : -1;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { developer: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, offPlanPropertyRepo_1.getOffPlanPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, offPlanProperties: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const offPlanProperties = await (0, offPlanPropertyRepo_1.fetchAllOffPlansForAdmin)(query, skip, parseInt(limit), sortCriteria);
    return { totalCount, offPlanProperties };
};
exports.getAllOffPlansForAdminUseCase = getAllOffPlansForAdminUseCase;
const getAllExclusiveOffPlansUseCase = async (queryParams) => {
    const { page = '1' } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false, isExclusive: true }; // Assuming you only want non-deleted documents
    const totalCount = await (0, offPlanPropertyRepo_1.getOffPlanPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, offPlanProperties: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const offPlanProperties = await (0, offPlanPropertyRepo_1.fetchAllExclusiveOffPlanProperties)(query, skip, parseInt(limit));
    return { totalCount, offPlanProperties };
};
exports.getAllExclusiveOffPlansUseCase = getAllExclusiveOffPlansUseCase;
const createOffPlanUseCase = async (data) => {
    // check for  unique value duplications
    const offPlanProperty = await (0, offPlanPropertyRepo_1.createOffPlanProperty)(data);
    if (!offPlanProperty) {
        throw new appError_1.default('Couldn\'t Create new offPlan Property. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createOffPlanUseCase = createOffPlanUseCase;
const getOffPlansByFilterUseCase = async (filter) => {
    const { search, features, propertySize, price, propertyType, sortBy, order = 'desc', page = 1, } = filter;
    const { limit = 10 } = filter;
    // Sorting
    const sortCriteria = {};
    sortCriteria[sortBy || 'createdAt'] = order === 'asc' ? 1 : -1;
    // Build the query object dynamically
    const query = {
        isDeleted: false,
    };
    if (propertyType)
        query.category = propertyType;
    if (price) {
        if (price?.min)
            query.startingPrice = { $gte: price.min };
        if (price?.max)
            query.startingPrice = { ...query.startingPrice, $lte: price.max };
    }
    if (propertySize) {
        if (propertySize?.min)
            query.size = { $gte: propertySize.min };
        if (propertySize?.max)
            query.size = { ...query.size, $lte: propertySize.max };
    }
    // Search keywords for location or title
    if (search && search.length > 0) {
        query.$or = [
            { location: { $regex: search.join('|'), $options: 'i' } },
            { title: { $regex: search.join('|'), $options: 'i' } },
            // { slug: { $regex: search.join('|'), $options: 'i' } },
        ];
    }
    // Match features if provided
    if (features && features.length > 0)
        query.features = { $all: features };
    const totalCount = await (0, offPlanPropertyRepo_1.getOffPlanPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, properties: [] };
    const skip = (page - 1) * limit;
    const properties = await (0, offPlanPropertyRepo_1.fetchOffplanPropertiesByFilter)(query, skip, limit, sortCriteria);
    return { totalCount, properties };
};
exports.getOffPlansByFilterUseCase = getOffPlansByFilterUseCase;
const getKeywordsListUseCase = async (queryParams) => {
    const { keyword = '' } = queryParams;
    const query = {
        isDeleted: false,
    };
    if (keyword && keyword.length > 0) {
        query['$or'] = [
            { location: { $regex: keyword, $options: 'i' } },
            { title: { $regex: keyword, $options: 'i' } },
        ];
    }
    const keywordProperties = await (0, offPlanPropertyRepo_1.fetchOffPlanPropertiesByKeyword)(query);
    // Check for match and add to Set (which automatically avoids duplicates)
    const keywordSet = new Set();
    keywordProperties.forEach((property) => {
        const regex = new RegExp(keyword, 'i');
        if (property.location && regex.test(property.location)) {
            keywordSet.add(property.location);
        }
        if (property.title && regex.test(property.title)) {
            keywordSet.add(property.title);
        }
    });
    // Convert Set back to an array and sort alphabetically
    return Array.from(keywordSet).sort((a, b) => a.localeCompare(b));
};
exports.getKeywordsListUseCase = getKeywordsListUseCase;
const updateOffPlanByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingOffPlanProperty = await fetchOffPlanPropertyById(id);
        // check for  unique value updations
        const offPlanProperty = await (0, offPlanPropertyRepo_1.updateOffPlanPropertyById)(id, data);
        if (!offPlanProperty)
            throw new appError_1.default('Couldn\'t update OffPlan Property', httpStatus_1.HttpStatus.NOT_FOUND);
        return offPlanProperty;
    }
    throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateOffPlanByIdUseCase = updateOffPlanByIdUseCase;
const deleteOffPlanByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const offPlanProperty = await (0, offPlanPropertyRepo_1.deleteOffPlanPropertyById)(id);
        // check for  unique value updations
        if (offPlanProperty)
            return true;
    }
    throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteOffPlanByIdUseCase = deleteOffPlanByIdUseCase;
const getOffPlanByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const offPlanProperty = await (0, offPlanPropertyRepo_1.fetchOffPlanPropertyById)(query._id);
        if (offPlanProperty)
            return offPlanProperty;
    }
    throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getOffPlanByIdUseCase = getOffPlanByIdUseCase;
const getOffPlanBySlugUseCase = async (slug) => {
    const offPlanProperty = await (0, offPlanPropertyRepo_1.fetchOffPlanPropertyBySlug)({ slug, isDeleted: false });
    if (offPlanProperty)
        return offPlanProperty;
    throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getOffPlanBySlugUseCase = getOffPlanBySlugUseCase;
const getOffPlanMetaBySlugUseCase = async (slug) => {
    const offPlanProperty = await (0, offPlanPropertyRepo_1.fetchOffPlanMetaBySlug)({ slug, isDeleted: false });
    if (offPlanProperty)
        return offPlanProperty;
    throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getOffPlanMetaBySlugUseCase = getOffPlanMetaBySlugUseCase;
const updateFeaturedOffPlanUseCase = async (data) => {
    // check for  unique value duplications
    if (!(0, objectIdParser_1.ObjectID)(data.id)) {
        throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const offPlanProperty = await (0, offPlanPropertyRepo_1.fetchOffPlanPropertyById)(data.id);
    if (!offPlanProperty)
        throw new appError_1.default('No OffPlan Property Found', httpStatus_1.HttpStatus.NOT_FOUND);
    await (0, offPlanPropertyRepo_1.updateFeaturedPropertyById)(data.id, data.featuredProperty);
    return true;
};
exports.updateFeaturedOffPlanUseCase = updateFeaturedOffPlanUseCase;
