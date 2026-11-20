"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertGoogleReview = exports.createGoogleReview = exports.updateGoogleReviewById = exports.deleteGoogleReviewById = exports.fetchGoogleReviewMetaBySlug = exports.fetchGoogleReviewBySlug = exports.fetchGoogleReviewById = exports.fetchAllGoogleReviewsForAdmin = exports.fetchAllGoogleReviews = exports.getGoogleReviewsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const googleReviewModel_1 = __importDefault(require("../models/googleReviewModel"));
const getGoogleReviewsCount = async (query) => {
    return await googleReviewModel_1.default.countDocuments(query);
};
exports.getGoogleReviewsCount = getGoogleReviewsCount;
const fetchAllGoogleReviews = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await googleReviewModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllGoogleReviews = fetchAllGoogleReviews;
const fetchAllGoogleReviewsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await googleReviewModel_1.default
        .find(dbQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllGoogleReviewsForAdmin = fetchAllGoogleReviewsForAdmin;
const fetchGoogleReviewById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await googleReviewModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, __v: 0 })
        .lean();
};
exports.fetchGoogleReviewById = fetchGoogleReviewById;
const fetchGoogleReviewBySlug = async (query) => {
    return await googleReviewModel_1.default.findOne(query).select({ _id: 0, isDeleted: 0, __v: 0 }).lean();
};
exports.fetchGoogleReviewBySlug = fetchGoogleReviewBySlug;
const fetchGoogleReviewMetaBySlug = async (query) => {
    return await googleReviewModel_1.default
        .findOne(query)
        .select({ metaTitle: 1, metaDescription: 1, bannerImage: 1, _id: 0 })
        .lean();
};
exports.fetchGoogleReviewMetaBySlug = fetchGoogleReviewMetaBySlug;
const deleteGoogleReviewById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await googleReviewModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteGoogleReviewById = deleteGoogleReviewById;
const updateGoogleReviewById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await googleReviewModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateGoogleReviewById = updateGoogleReviewById;
const createGoogleReview = async (data) => {
    return await googleReviewModel_1.default.create(data);
};
exports.createGoogleReview = createGoogleReview;
const upsertGoogleReview = async (data) => {
    await googleReviewModel_1.default.updateOne({
        authorName: data.authorName,
        reviewTime: data.reviewTime,
    }, {
        $set: {
            placeId: data.placeId,
            reviewId: data.reviewId,
            authorName: data.authorName,
            rating: data.rating,
            text: data.text,
            profilePhotoUrl: data.profilePhotoUrl,
            reviewTime: data.reviewTime,
        },
    }, { upsert: true });
};
exports.upsertGoogleReview = upsertGoogleReview;
