"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeaturedPropertyById = exports.createOffPlanProperty = exports.updateOffPlanPropertyById = exports.deleteOffPlanPropertyById = exports.fetchOffPlanPropertyBySlug = exports.fetchOffPlanMetaBySlug = exports.fetchOffPlanPropertiesByKeyword = exports.fetchOffPlanPropertyById = exports.fetchAllExclusiveOffPlanProperties = exports.fetchOffplanPropertiesByFilter = exports.fetchAllOffPlansForAdmin = exports.fetchAllOffPlanProperties = exports.getOffPlanPropertiesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const offPlanPropertyModel_1 = __importDefault(require("../models/offPlanPropertyModel"));
const getOffPlanPropertiesCount = async (query) => {
    return await offPlanPropertyModel_1.default.countDocuments(query);
};
exports.getOffPlanPropertiesCount = getOffPlanPropertiesCount;
const fetchAllOffPlanProperties = async (query, skip, limit, sortCriteria) => {
    return await offPlanPropertyModel_1.default
        .find(query)
        .select({
        bannerImage: 1,
        images: 1,
        title: 1,
        shortDescription: 1,
        location: 1,
        neighbourhood: 1,
        developer: 1,
        startingPrice: 1,
        category: 1,
        handoverYear: 1,
        isExclusive: 1,
        isLuxury: 1,
        'paymentPlanDetails.name': 1,
        'paymentPlanDetails.percentage': 1,
        size: 1,
        bedrooms: 1,
        slug: 1,
        featuredProperty: 1,
        propertyOffers: 1,
        _id: 0, // Exclude _id field
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllOffPlanProperties = fetchAllOffPlanProperties;
const fetchAllOffPlansForAdmin = async (query, skip, limit, sortCriteria) => {
    return await offPlanPropertyModel_1.default
        .find(query)
        .select({
        _id: 1,
        bannerImage: 1,
        title: 1,
        location: 1,
        // neighbourhood: 1,
        developer: 1,
        startingPrice: 1,
        category: 1,
        featuredProperty: 1,
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllOffPlansForAdmin = fetchAllOffPlansForAdmin;
const fetchOffplanPropertiesByFilter = async (query, skip, limit, sortCriteria) => {
    return await offPlanPropertyModel_1.default
        .find(query)
        .select({
        bannerImage: 1,
        images: 1,
        title: 1,
        shortDescription: 1,
        location: 1,
        subLocation: 1,
        developer: 1,
        startingPrice: 1,
        category: 1,
        handoverYear: 1,
        isExclusive: 1,
        'paymentPlanDetails.name': 1,
        'paymentPlanDetails.percentage': 1,
        slug: 1,
        featuredProperty: 1,
        size: 1,
        _id: 0, // Exclude _id field
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchOffplanPropertiesByFilter = fetchOffplanPropertiesByFilter;
const fetchAllExclusiveOffPlanProperties = async (query, skip, limit) => {
    return await offPlanPropertyModel_1.default
        .find(query)
        .select({
        bannerImage: 1,
        roi: 1,
        primeLocation: 1,
        design: 1,
        title: 1,
        location: 1,
        neighbourhood: 1,
        startingPrice: 1,
        shortDescription: 1,
        handoverYear: 1,
        slug: 1,
        shortPaymentPlan: 1,
        category: 1,
        updatedAt: 1,
        _id: 0, // Exclude _id field
    })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllExclusiveOffPlanProperties = fetchAllExclusiveOffPlanProperties;
const fetchOffPlanPropertyById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await offPlanPropertyModel_1.default
        .findOne(dbQuery)
        .select({
        // floorPlanPDF: 0,
        isDeleted: 0,
        isActive: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        'floorPlans._id': 0,
        'faq._id': 0,
        'paymentPlanDetails._id': 0,
    })
        .lean();
};
exports.fetchOffPlanPropertyById = fetchOffPlanPropertyById;
const fetchOffPlanPropertiesByKeyword = async (query) => {
    return await offPlanPropertyModel_1.default.find(query).select({ title: 1, location: 1 }).lean();
};
exports.fetchOffPlanPropertiesByKeyword = fetchOffPlanPropertiesByKeyword;
const fetchOffPlanMetaBySlug = async (query) => {
    return await offPlanPropertyModel_1.default
        .findOne(query)
        .select({
        _id: 0,
        title: 1,
        shortDescription: 1,
        bannerImage: 1,
    })
        .lean();
};
exports.fetchOffPlanMetaBySlug = fetchOffPlanMetaBySlug;
const fetchOffPlanPropertyBySlug = async (query) => {
    return await offPlanPropertyModel_1.default
        .findOne(query)
        .select({
        // floorPlanPDF: 0,
        isDeleted: 0,
        isActive: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        'floorPlans._id': 0,
        'faq._id': 0,
        'paymentPlanDetails._id': 0,
    })
        .lean();
};
exports.fetchOffPlanPropertyBySlug = fetchOffPlanPropertyBySlug;
const deleteOffPlanPropertyById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await offPlanPropertyModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteOffPlanPropertyById = deleteOffPlanPropertyById;
const updateOffPlanPropertyById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await offPlanPropertyModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateOffPlanPropertyById = updateOffPlanPropertyById;
const createOffPlanProperty = async (data) => {
    return await offPlanPropertyModel_1.default.create(data);
};
exports.createOffPlanProperty = createOffPlanProperty;
const updateFeaturedPropertyById = async (id, featuredProperty) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await offPlanPropertyModel_1.default.findOneAndUpdate(dbQuery, { featuredProperty });
};
exports.updateFeaturedPropertyById = updateFeaturedPropertyById;
