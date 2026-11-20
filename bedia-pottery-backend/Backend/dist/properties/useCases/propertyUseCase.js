"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchXMLFeedUseCase = exports.fetchLocalityCountUseCase = exports.getPropertyMetaBySlugUseCase = exports.getPropertyBySlugUseCase = exports.getPropertyByIdUseCase = exports.getKeywordsListUseCase = exports.getPropertiesByFilterUseCase = exports.getAllPropertiesUseCase = void 0;
const propertyRepo_1 = require("../repos/propertyRepo");
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const configKeys_1 = __importDefault(require("../../configKeys"));
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const objectIdParser_1 = require("../../utils/objectIdParser");
const logger_1 = __importDefault(require("../../config/logger"));
const getAllPropertiesUseCase = async (queryParams, admin = false) => {
    const { page = '1', propertyPurpose, search, sortBy, order = 'asc', location } = queryParams;
    const { limit = '10' } = queryParams;
    // Sorting
    const sortCriteria = {};
    if (sortBy) {
        sortCriteria[sortBy] = order === 'asc' ? 1 : -1;
    }
    else {
        sortCriteria['createdAt'] = -1;
    }
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (propertyPurpose) {
        query.propertyPurpose = propertyPurpose;
    }
    if (search && search.length > 0) {
        query['$or'] = [
            { propertyTitle: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { locality: { $regex: search, $options: 'i' } },
            { propertyRefNo: { $regex: search, $options: 'i' } },
        ];
    }
    if (location) {
        query['locality'] = location;
    }
    const totalCount = await (0, propertyRepo_1.getPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, properties: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    if (admin) {
        const properties = await (0, propertyRepo_1.fetchAllPropertiesForAdmin)(query, skip, parseInt(limit), sortCriteria);
        return { totalCount, properties };
    }
    else {
        const properties = await (0, propertyRepo_1.fetchAllProperties)(query, skip, parseInt(limit), sortCriteria);
        return { totalCount, properties };
    }
};
exports.getAllPropertiesUseCase = getAllPropertiesUseCase;
const getPropertiesByFilterUseCase = async (filter) => {
    const { propertyPurpose, search, features, propertySize, bedrooms, price, propertyType, sortBy, order = 'desc', page = 1, } = filter;
    const { limit = 10 } = filter;
    // Sorting
    const sortCriteria = {};
    sortCriteria[sortBy || 'createdAt'] = order === 'asc' ? 1 : -1;
    // Build the query object dynamically
    const query = {
        isDeleted: false,
        propertyPurpose,
    };
    if (propertyType) {
        if (propertyType === 'Commercial') {
            query.propertyType = { $in: ['Office Space', 'Commercial Land'] }; // change in  future
        }
        else
            query.propertyType = propertyType;
    }
    if (price) {
        if (price?.min)
            query.price = { $gte: price.min };
        if (price?.max)
            query.price = { ...query.price, $lte: price.max };
    }
    if (bedrooms) {
        if (bedrooms?.min !== undefined)
            query.bedrooms = { $gte: bedrooms.min };
        if (bedrooms?.max !== undefined)
            query.bedrooms = { ...query.bedrooms, $lte: bedrooms.max };
    }
    if (propertySize) {
        if (propertySize?.min)
            query.propertySize = { $gte: propertySize.min };
        if (propertySize?.max)
            query.propertySize = { ...query.propertySize, $lte: propertySize.max };
    }
    // Search keywords for locality or propertyTitle
    if (search && search.length > 0) {
        query.$or = [
            { locality: { $regex: search.join('|'), $options: 'i' } },
            { subLocality: { $regex: search.join('|'), $options: 'i' } },
            { propertyRefNo: { $regex: search.join('|'), $options: 'i' } },
        ];
    }
    // Match features if provided
    if (features && features.length > 0) {
        query.features = { $all: features };
    }
    const totalCount = await (0, propertyRepo_1.getPropertiesCount)(query);
    if (!totalCount)
        return { totalCount: 0, properties: [] };
    const skip = (page - 1) * limit;
    const properties = await (0, propertyRepo_1.fetchPropertiesByFilter)(query, skip, limit, sortCriteria);
    return { totalCount, properties };
};
exports.getPropertiesByFilterUseCase = getPropertiesByFilterUseCase;
const getKeywordsListUseCase = async (queryParams) => {
    const { keyword = '', propertyPurpose } = queryParams;
    const query = {
        isDeleted: false,
        propertyPurpose: propertyPurpose,
    };
    if (keyword && keyword.length > 0) {
        query['$or'] = [
            { subLocality: { $regex: keyword, $options: 'i' } },
            { locality: { $regex: keyword, $options: 'i' } },
            { propertyRefNo: { $regex: keyword, $options: 'i' } },
        ];
    }
    const keywordProperties = await (0, propertyRepo_1.fetchPropertiesByKeyword)(query);
    // Check for match and add to Set (which automatically avoids duplicates)
    const keywordSet = new Set();
    keywordProperties.forEach((property) => {
        const regex = new RegExp(keyword, 'i');
        if (property.locality && regex.test(property.locality)) {
            keywordSet.add(property.locality);
        }
        if (property.subLocality && regex.test(property.subLocality)) {
            keywordSet.add(property.subLocality);
        }
        if (property.propertyRefNo && regex.test(property.propertyRefNo)) {
            keywordSet.add(property.propertyRefNo);
        }
    });
    // Convert Set back to an array and sort alphabetically
    return Array.from(keywordSet).sort((a, b) => a.localeCompare(b));
};
exports.getKeywordsListUseCase = getKeywordsListUseCase;
const getPropertyByIdUseCase = async (propertyId) => {
    if ((0, objectIdParser_1.ObjectID)(propertyId) === null)
        throw new appError_1.default('Invalid property id', httpStatus_1.HttpStatus.BAD_REQUEST);
    const property = await (0, propertyRepo_1.fetchPropertyById)(propertyId);
    if (!property)
        throw new appError_1.default('Property not found', httpStatus_1.HttpStatus.NOT_FOUND);
    return property;
};
exports.getPropertyByIdUseCase = getPropertyByIdUseCase;
const getPropertyBySlugUseCase = async (slug) => {
    const property = await (0, propertyRepo_1.fetchPropertyBySlug)({ slug, isDeleted: false });
    if (!property)
        throw new appError_1.default('Property not found', httpStatus_1.HttpStatus.NOT_FOUND);
    const { listingAgentEmail } = property;
    delete property.listingAgentEmail;
    if (listingAgentEmail && listingAgentEmail.length !== 0) {
        const query = { email: listingAgentEmail, isDeleted: false };
        const listingAgent = await (0, propertyRepo_1.fetchAgentByEmail)(query);
        if (listingAgent) {
            return { ...property, listingAgent };
        }
    }
    const defaultgent = await (0, propertyRepo_1.fetchAgentByEmail)({
        email: configKeys_1.default.DEFAULT_AGENT_MAIL,
        isDeleted: false,
    });
    return { ...property, listingAgent: defaultgent };
};
exports.getPropertyBySlugUseCase = getPropertyBySlugUseCase;
const getPropertyMetaBySlugUseCase = async (slug) => {
    const property = await (0, propertyRepo_1.fetchPropertyMetaBySlug)({ slug, isDeleted: false });
    if (!property)
        throw new appError_1.default('Property not found', httpStatus_1.HttpStatus.NOT_FOUND);
    return property;
};
exports.getPropertyMetaBySlugUseCase = getPropertyMetaBySlugUseCase;
const fetchLocalityCountUseCase = async () => {
    const allLocalities = await (0, propertyRepo_1.fetchAllLocalities)();
    return allLocalities;
};
exports.fetchLocalityCountUseCase = fetchLocalityCountUseCase;
const fetchXMLFeedUseCase = async () => {
    // Fetch XML data from third-party API
    const response = await axios_1.default.get(configKeys_1.default.XML_API);
    const xmlData = response.data;
    // Convert XML to JSON
    const jsonData = await (0, xml2js_1.parseStringPromise)(xmlData);
    if (!jsonData.Properties.Property) {
        throw new Error('Invalid XML data');
    }
    const propertyList = convertToProperty(jsonData.Properties.Property);
    const deletedCount = await (0, propertyRepo_1.clearAllProperties)();
    logger_1.default.info(`Deleted ${deletedCount} properties`);
    await (0, propertyRepo_1.insertProperties)(propertyList);
    logger_1.default.info(`Inserted ${propertyList.length} properties`);
    return true;
};
exports.fetchXMLFeedUseCase = fetchXMLFeedUseCase;
const convertToProperty = (input) => {
    return input
        .map((item) => item.Property_Status?.[0] === 'live' && {
        propertySizeUnit: item.Property_Size_Unit?.[0],
        lastUpdated: item.Last_Updated || '',
        features: item.Features?.[0]?.Feature || [],
        images: item.Images?.[0]?.Image || [],
        portals: item.Portals?.[0]?.Portal || [],
        permitNumber: item.Permit_Number?.[0],
        propertyTitle: item.Property_Title?.[0],
        propertyDescription: item.Property_Description?.[0],
        propertyTitleAR: item.Property_Title_AR?.[0],
        propertyDescriptionAR: item.Property_Description_AR?.[0],
        price: item.Price && item.Price[0] != '' ? parseFloat(item.Price[0]) : undefined,
        propertyPurpose: item.Property_purpose?.[0],
        city: item.City?.[0],
        locality: item.Locality?.[0],
        subLocality: item.Sub_Locality?.[0],
        towerName: item.Tower_Name?.[0],
        videos: item.Videos?.[0]?.Video || [],
        propertyStatus: item.Property_Status?.[0],
        bathrooms: item.Bathrooms && item.Bathrooms[0] != '' ? parseInt(item.Bathrooms[0], 10) : undefined,
        bedrooms: item.Bedrooms && item.Bedrooms[0] != ''
            ? item.Bedrooms[0] === 'studio'
                ? 0
                : parseInt(item.Bedrooms[0], 10)
            : undefined,
        propertyRefNo: item.Property_Ref_No?.[0],
        propertySize: item.Property_Size && item.Property_Size[0] != ''
            ? parseInt(item.Property_Size[0], 10)
            : undefined,
        furnished: item.Furnished?.[0],
        propertyType: item.Property_Type?.[0],
        listingAgent: item.Listing_Agent?.[0],
        listingAgentEmail: item.Listing_Agent_Email?.[0],
        listingAgentPhone: item.Listing_Agent_Phone?.[0],
    })
        .filter((item) => item !== false);
};
