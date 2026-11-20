"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllProperties = exports.insertProperties = exports.fetchAllLocalities = exports.fetchAgentByEmail = exports.fetchPropertyMetaBySlug = exports.fetchPropertyBySlug = exports.fetchPropertyById = exports.fetchPropertiesByKeyword = exports.getPropertiesCount = exports.fetchPropertiesByFilter = exports.fetchAllPropertiesForAdmin = exports.fetchAllProperties = void 0;
const slugify_1 = __importDefault(require("slugify"));
const objectIdParser_1 = require("../../utils/objectIdParser");
const propertyModel_1 = __importDefault(require("../models/propertyModel"));
const agentModel_1 = __importDefault(require("../../agent/models/agentModel"));
const fetchAllProperties = async (query, skip, limit, sortCriteria) => {
    return await propertyModel_1.default
        .find(query)
        .select({
        images: 1,
        price: 1,
        propertyTitle: 1,
        propertyDescription: 1,
        propertyPurpose: 1,
        locality: 1,
        subLocality: 1,
        toString: 1,
        propertyRefNo: 1,
        bedrooms: 1,
        bathrooms: 1,
        propertySize: 1,
        listingAgentEmail: 1,
        listingAgentPhone: 1,
        propertyType: 1,
        slug: 1,
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllProperties = fetchAllProperties;
const fetchAllPropertiesForAdmin = async (query, skip, limit, sortCriteria) => {
    return await propertyModel_1.default
        .find(query)
        .select({
        _id: 1,
        images: 1,
        price: 1,
        propertyTitle: 1,
        propertyPurpose: 1,
        locality: 1,
        bedrooms: 1,
        bathrooms: 1,
        propertySize: 1,
        listingAgentEmail: 1,
        listingAgentPhone: 1,
        slug: 1,
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllPropertiesForAdmin = fetchAllPropertiesForAdmin;
const fetchPropertiesByFilter = async (query, skip, limit, sortCriteria) => {
    return await propertyModel_1.default
        .find(query)
        .select({
        images: 1,
        price: 1,
        propertyTitle: 1,
        propertyDescription: 1,
        propertyPurpose: 1,
        locality: 1,
        towerName: 1,
        subLocality: 1,
        propertyRefNo: 1,
        bedrooms: 1,
        bathrooms: 1,
        propertySize: 1,
        listingAgentEmail: 1,
        listingAgentPhone: 1,
        slug: 1,
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchPropertiesByFilter = fetchPropertiesByFilter;
const getPropertiesCount = async (query) => {
    return await propertyModel_1.default.countDocuments(query);
};
exports.getPropertiesCount = getPropertiesCount;
const fetchPropertiesByKeyword = async (query) => {
    return await propertyModel_1.default
        .find(query)
        .select({ subLocality: 1, locality: 1, propertyRefNo: 1 })
        .lean();
};
exports.fetchPropertiesByKeyword = fetchPropertiesByKeyword;
const fetchPropertyById = async (propertyId) => {
    const query = { _id: (0, objectIdParser_1.ObjectID)(propertyId), isDeleted: false };
    return await propertyModel_1.default.findOne(query).select({
        _id: 0,
        isDeleted: 0,
        isActive: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    });
};
exports.fetchPropertyById = fetchPropertyById;
const fetchPropertyBySlug = async (query) => {
    return await propertyModel_1.default
        .findOne(query)
        .select({
        _id: 0,
        listingAgentPhone: 0,
        listingAgent: 0,
        isDeleted: 0,
        isActive: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .lean();
};
exports.fetchPropertyBySlug = fetchPropertyBySlug;
const fetchPropertyMetaBySlug = async (query) => {
    return await propertyModel_1.default
        .findOne(query)
        .select({
        _id: 0,
        propertyTitle: 1,
        propertyDescription: 1,
        images: 1,
    })
        .lean();
};
exports.fetchPropertyMetaBySlug = fetchPropertyMetaBySlug;
const fetchAgentByEmail = async (query) => {
    return await agentModel_1.default
        .findOne(query)
        .select({
        _id: 0,
        isDeleted: 0,
        slug: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .lean();
};
exports.fetchAgentByEmail = fetchAgentByEmail;
const fetchAllLocalities = async () => {
    return await propertyModel_1.default
        .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$locality', count: { $sum: 1 } } },
        { $project: { _id: 0, locality: '$_id', count: 1 } },
    ])
        .exec();
};
exports.fetchAllLocalities = fetchAllLocalities;
const generateSlugsForBulkWrite = async (documents) => {
    const processedDocuments = [...documents];
    const allSlugs = new Set();
    // First pass: Generate base slugs
    for (const doc of processedDocuments) {
        if (doc.propertyTitle) {
            const baseSlug = (0, slugify_1.default)(doc.propertyTitle, {
                lower: true,
                strict: true,
                replacement: '-',
                remove: /[^a-zA-Z0-9 -]/g,
            });
            doc.slug = baseSlug;
            allSlugs.add(baseSlug);
        }
    }
    // Check existing slugs in the database
    const existingSlugs = await propertyModel_1.default.find().select('slug');
    const usedSlugs = new Set(existingSlugs.map((e) => e.slug));
    // Second pass: Resolve slug conflicts
    for (const doc of processedDocuments) {
        if (doc.propertyTitle) {
            let slug = doc.slug;
            let suffix = 1;
            while (usedSlugs.has(slug) || processedDocuments.filter((d) => d.slug === slug).length > 1) {
                suffix++;
                slug = `${doc.slug}-${suffix}`;
            }
            doc.slug = slug;
            usedSlugs.add(slug);
        }
    }
    return processedDocuments;
};
const insertProperties = async (properties) => {
    const documentsWithSlugs = await generateSlugsForBulkWrite(properties);
    const bulkOps = await Promise.all(documentsWithSlugs.map(async (property) => {
        return {
            insertOne: {
                document: property,
            },
        };
    }));
    await propertyModel_1.default.bulkWrite(bulkOps);
    return true;
};
exports.insertProperties = insertProperties;
const clearAllProperties = async () => {
    return (await propertyModel_1.default.deleteMany({})).deletedCount;
};
exports.clearAllProperties = clearAllProperties;
