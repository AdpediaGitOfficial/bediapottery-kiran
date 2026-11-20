"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleReviewMetaBySlugUseCase = exports.getGoogleReviewBySlugUseCase = exports.getGoogleReviewByIdUseCase = exports.deleteGoogleReviewByIdUseCase = exports.updateGoogleReviewByIdUseCase = exports.createGoogleReviewUseCase = exports.getAllGoogleReviewsForAdminUseCase = exports.getAllGoogleReviewsUseCase = exports.getGoogleReviewRatingSummaryUseCase = exports.syncGoogleReviewsUseCase = void 0;
const googleReviewRepo_1 = require("../repos/googleReviewRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const googleReviewFetch_service_1 = require("../../services/googleReviewFetch.service");
const syncGoogleReviewsUseCase = async () => {
    const reviews = await (0, googleReviewFetch_service_1.fetchGoogleReviewsFromAPI)();
    if (!reviews?.length)
        return true;
    const placeId = process.env.GOOGLE_PLACE_ID;
    for (const review of reviews) {
        // The legacy Places API does not return a stable review id, so `review_id`
        // is undefined. The schema requires `reviewId` and marks it unique, which
        // means every review would collide on `reviewId: null` and abort the sync
        // after the first insert. Synthesise a deterministic id from the same fields
        // used as the dedup key (author + time) so it is stable across re-syncs.
        const reviewId = review.review_id || `${placeId}_${review.author_name}_${review.time}`;
        const payload = {
            placeId,
            reviewId,
            authorName: review.author_name,
            rating: review.rating,
            text: review.text,
            profilePhotoUrl: review.profile_photo_url,
            reviewTime: review.time,
        };
        await (0, googleReviewRepo_1.upsertGoogleReview)(payload);
    }
    return true;
};
exports.syncGoogleReviewsUseCase = syncGoogleReviewsUseCase;
/**
 * Place-wide rating shown above the review list, read live from Google.
 * It is deliberately never derived from the `reviews` collection: the sync only
 * ever stored the handful of reviews the Places API returns (5 at a time) and
 * was not running from day one, so an average over those rows would understate
 * both the rating and the count. Returns null when Google has never answered —
 * the client should hide the rating rather than show a wrong one.
 */
const getGoogleReviewRatingSummaryUseCase = async () => {
    return await (0, googleReviewFetch_service_1.fetchGooglePlaceRatingFromAPI)();
};
exports.getGoogleReviewRatingSummaryUseCase = getGoogleReviewRatingSummaryUseCase;
const getAllGoogleReviewsUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const [totalCount, ratingSummary] = await Promise.all([
        (0, googleReviewRepo_1.getGoogleReviewsCount)(query),
        (0, exports.getGoogleReviewRatingSummaryUseCase)(),
    ]);
    // `totalCount` is how many reviews were synced into the DB;
    // `ratingSummary.totalReviews` is how many ratings Google actually holds.
    if (!totalCount)
        return { totalCount: 0, googleReviews: [], ratingSummary };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const googleReviews = await (0, googleReviewRepo_1.fetchAllGoogleReviews)(query, skip, parseInt(limit));
    return { totalCount, googleReviews, ratingSummary };
};
exports.getAllGoogleReviewsUseCase = getAllGoogleReviewsUseCase;
const getAllGoogleReviewsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { authorName: { $regex: search, $options: 'i' } }, // Case-insensitive search
        ];
    }
    const totalCount = await (0, googleReviewRepo_1.getGoogleReviewsCount)(query);
    if (!totalCount)
        return { totalCount: 0, googleReviews: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const googleReviews = await (0, googleReviewRepo_1.fetchAllGoogleReviewsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, googleReviews };
};
exports.getAllGoogleReviewsForAdminUseCase = getAllGoogleReviewsForAdminUseCase;
const createGoogleReviewUseCase = async (data) => {
    // Reviews created through this endpoint are entered by an admin, not pulled
    // from the Google sync (which uses upsertGoogleReview). Default them to
    // 'manual' so they are distinguishable from synced Google reviews; honour an
    // explicit source if one was provided.
    const payload = {
        ...data,
        source: data.source || 'manual',
    };
    const googleReview = await (0, googleReviewRepo_1.createGoogleReview)(payload);
    if (!googleReview) {
        throw new appError_1.default('Couldn\'t Create new GoogleReview. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createGoogleReviewUseCase = createGoogleReviewUseCase;
const updateGoogleReviewByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingGoogleReview = await fetchGoogleReviewById(id);
        // check for  unique value updations
        const googleReview = await (0, googleReviewRepo_1.updateGoogleReviewById)(id, data);
        if (!googleReview)
            throw new appError_1.default('Couldn\'t update GoogleReview', httpStatus_1.HttpStatus.NOT_FOUND);
        return googleReview;
    }
    throw new appError_1.default('No GoogleReview Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateGoogleReviewByIdUseCase = updateGoogleReviewByIdUseCase;
const deleteGoogleReviewByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const googleReview = await (0, googleReviewRepo_1.deleteGoogleReviewById)(id);
        // check for  unique value updations
        if (googleReview)
            return true;
    }
    throw new appError_1.default('No GoogleReview Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteGoogleReviewByIdUseCase = deleteGoogleReviewByIdUseCase;
const getGoogleReviewByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const googleReview = await (0, googleReviewRepo_1.fetchGoogleReviewById)(query._id);
        if (googleReview)
            return googleReview;
    }
    throw new appError_1.default('No GoogleReview Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getGoogleReviewByIdUseCase = getGoogleReviewByIdUseCase;
const getGoogleReviewBySlugUseCase = async (slug) => {
    const googleReview = await (0, googleReviewRepo_1.fetchGoogleReviewBySlug)({ slug, isDeleted: false });
    if (googleReview)
        return googleReview;
    throw new appError_1.default('No GoogleReview Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getGoogleReviewBySlugUseCase = getGoogleReviewBySlugUseCase;
const getGoogleReviewMetaBySlugUseCase = async (slug) => {
    const googleReview = await (0, googleReviewRepo_1.fetchGoogleReviewMetaBySlug)({ slug, isDeleted: false });
    if (googleReview)
        return googleReview;
    throw new appError_1.default('No GoogleReview Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getGoogleReviewMetaBySlugUseCase = getGoogleReviewMetaBySlugUseCase;
