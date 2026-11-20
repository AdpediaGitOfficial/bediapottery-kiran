"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.updateCategoryById = exports.hasChildCategories = exports.deleteCategoryById = exports.fetchCategoryBySlug = exports.fetchCategoryById = exports.fetchAllCategoriesForAdmin = exports.fetchAllCategories = exports.getCategoriesCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const getCategoriesCount = async (query) => {
    return await categoryModel_1.default.countDocuments(query);
};
exports.getCategoriesCount = getCategoriesCount;
const fetchAllCategories = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
        isActive: true,
    };
    return await categoryModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
exports.fetchAllCategories = fetchAllCategories;
const fetchAllCategoriesForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await categoryModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllCategoriesForAdmin = fetchAllCategoriesForAdmin;
const fetchCategoryById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await categoryModel_1.default
        .findOne(dbQuery)
        .populate('parentId', 'title')
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchCategoryById = fetchCategoryById;
const fetchCategoryBySlug = async (slug) => {
    const dbQuery = {
        slug: slug,
        isDeleted: false,
        isActive: true,
    };
    return await categoryModel_1.default
        .findOne(dbQuery)
        .populate('parentId', 'title')
        .select({
        isDeleted: 0,
        isActive: 0,
        updatedAt: 0,
        __v: 0,
        createdAt: 0,
        showOnHomepage: 0,
        parentId: 0,
    })
        .lean();
};
exports.fetchCategoryBySlug = fetchCategoryBySlug;
const deleteCategoryById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await categoryModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteCategoryById = deleteCategoryById;
const hasChildCategories = async (id) => {
    const count = await categoryModel_1.default.countDocuments({
        parentId: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    });
    return count > 0;
};
exports.hasChildCategories = hasChildCategories;
const updateCategoryById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    // if (data.showOnHomepage === true) {
    //   // Disable homepage flag for all other categories
    //   await categoryModel.updateMany(
    //     {
    //       _id: { $ne: ObjectID(id) },
    //       showOnHomepage: true,
    //     },
    //     { $set: { showOnHomepage: false } },
    //   );
    // }
    return await categoryModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateCategoryById = updateCategoryById;
const createCategory = async (data) => {
    //  Disable homepage flag for all other categories
    // if (data.showOnHomepage === true) {
    //   await categoryModel.updateMany({ showOnHomepage: true }, { $set: { showOnHomepage: false } });
    // }
    return await categoryModel_1.default.create(data);
};
exports.createCategory = createCategory;
