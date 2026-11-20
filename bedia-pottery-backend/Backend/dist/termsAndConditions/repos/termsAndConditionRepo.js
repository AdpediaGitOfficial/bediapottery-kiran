"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsertTermsAndConditions = exports.createTermsAndCondition = exports.updateTermsAndConditionById = exports.deleteTermsAndConditionById = exports.fetchTermsAndConditionMetaBySlug = exports.fetchTermsAndConditionBySlug = exports.fetchTermsAndConditionById = exports.fetchAllTermsAndConditionsForAdmin = exports.fetchAllTermsAndConditions = exports.getTermsAndConditionsCount = void 0;
const slugify_1 = __importDefault(require("slugify"));
const objectIdParser_1 = require("../../utils/objectIdParser");
const termsAndConditionModel_1 = __importDefault(require("../models/termsAndConditionModel"));
const getTermsAndConditionsCount = async (query) => {
    return await termsAndConditionModel_1.default.countDocuments(query);
};
exports.getTermsAndConditionsCount = getTermsAndConditionsCount;
const fetchAllTermsAndConditions = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
        isActive: true,
    };
    return await termsAndConditionModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllTermsAndConditions = fetchAllTermsAndConditions;
const fetchAllTermsAndConditionsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await termsAndConditionModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllTermsAndConditionsForAdmin = fetchAllTermsAndConditionsForAdmin;
const fetchTermsAndConditionById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await termsAndConditionModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, isDeleted: 0, __v: 0 })
        .lean();
};
exports.fetchTermsAndConditionById = fetchTermsAndConditionById;
const fetchTermsAndConditionBySlug = async (query) => {
    return await termsAndConditionModel_1.default
        .findOne(query)
        .select({ _id: 0, isDeleted: 0, __v: 0 })
        .lean();
};
exports.fetchTermsAndConditionBySlug = fetchTermsAndConditionBySlug;
const fetchTermsAndConditionMetaBySlug = async (query) => {
    return await termsAndConditionModel_1.default
        .findOne(query)
        .select({ metaTitle: 1, metaDescription: 1, bannerImage: 1, _id: 0 })
        .lean();
};
exports.fetchTermsAndConditionMetaBySlug = fetchTermsAndConditionMetaBySlug;
const deleteTermsAndConditionById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await termsAndConditionModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteTermsAndConditionById = deleteTermsAndConditionById;
const updateTermsAndConditionById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await termsAndConditionModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateTermsAndConditionById = updateTermsAndConditionById;
const createTermsAndCondition = async (data) => {
    return await termsAndConditionModel_1.default.create(data);
};
exports.createTermsAndCondition = createTermsAndCondition;
const bulkInsertTermsAndConditions = async (data) => {
    const bulkOps = await Promise.all(data.map(async (termsAndCondition) => {
        const slug = await generateSlug(termsAndCondition.title);
        return {
            insertOne: {
                document: { ...termsAndCondition, slug },
            },
        };
    }));
    // const newData = data.map((d) => ({ insertOne: { document: d } }));
    await termsAndConditionModel_1.default.bulkWrite(bulkOps);
    return true;
};
exports.bulkInsertTermsAndConditions = bulkInsertTermsAndConditions;
const generateSlug = async (title) => {
    const baseSlug = (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        replacement: '-', // Replace every special character with hyphen
        remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
    });
    let suffix = 1;
    let slug = `${baseSlug}-1`;
    // Check if the slug already exists in the database
    while (await termsAndConditionModel_1.default.exists({ slug })) {
        suffix++;
        slug = `${baseSlug}-${suffix}`;
    }
    return slug;
};
