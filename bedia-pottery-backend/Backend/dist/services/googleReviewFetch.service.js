"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGooglePlaceRatingFromAPI = exports.fetchGoogleReviewsFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
// Place Details is billed per call and `/reviews/all` is a public, unauthenticated
// endpoint, so the live rating is cached in-process and refreshed at most once
// every three days instead of once per visitor. A place-wide average and rating
// count move slowly, so a few-days-old figure reads the same as a fresh one.
// Override with GOOGLE_PLACE_RATING_TTL_MS (in milliseconds) to change that.
const RATING_CACHE_TTL_MS = Number(process.env.GOOGLE_PLACE_RATING_TTL_MS) || 3 * 24 * 60 * 60 * 1000;
let ratingCache = null;
let inFlightRating = null;
const fetchPlaceDetails = async (params) => {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!placeId || !key) {
        console.error('Google Places: missing GOOGLE_PLACE_ID or GOOGLE_PLACES_API_KEY');
        return null;
    }
    const response = await axios_1.default.get(PLACE_DETAILS_URL, {
        params: { place_id: placeId, key, ...params },
    });
    const { status, error_message: errorMessage, result } = response.data || {};
    // The Places API returns HTTP 200 even on failure; the real outcome is in
    // `status`. Without billing enabled it returns REQUEST_DENIED with a message
    // like "You must enable Billing on the Google Cloud Project", and `result`
    // is absent — which previously made the sync silently save nothing.
    if (status !== 'OK') {
        console.error(`Google Places request failed: status=${status}`, errorMessage || '');
        return null;
    }
    return result || null;
};
const fetchGoogleReviewsFromAPI = async () => {
    const result = await fetchPlaceDetails({
        fields: 'reviews',
        // Default ordering is 'most_relevant', which mixes old and new reviews and
        // can omit the latest ones. 'newest' returns the most recent reviews first.
        // Note: the legacy Places API still returns at most 5 reviews per call.
        reviews_sort: 'newest',
    });
    return result?.reviews || [];
};
exports.fetchGoogleReviewsFromAPI = fetchGoogleReviewsFromAPI;
const loadPlaceRating = async () => {
    try {
        // `rating` is the place-wide average (1–5, one decimal) and
        // `user_ratings_total` the total number of ratings Google holds — both are
        // whole-place figures, unaffected by the 5-review cap on `reviews`.
        const result = await fetchPlaceDetails({ fields: 'rating,user_ratings_total' });
        if (!result || typeof result.rating !== 'number')
            return null;
        return {
            averageRating: result.rating,
            totalReviews: result.user_ratings_total || 0,
        };
    }
    catch (error) {
        // This runs on a public read endpoint, so an upstream outage must never
        // fail the request; the caller serves the last known figures instead.
        console.error('Google Places rating fetch failed:', error.message);
        return null;
    }
};
const fetchGooglePlaceRatingFromAPI = async () => {
    if (ratingCache && ratingCache.expiresAt > Date.now())
        return ratingCache.value;
    // Collapse concurrent misses into a single upstream call so a burst of
    // traffic after the TTL expires does not trigger a burst of billed requests.
    if (!inFlightRating) {
        inFlightRating = loadPlaceRating()
            .then((rating) => {
            if (rating)
                ratingCache = { value: rating, expiresAt: Date.now() + RATING_CACHE_TTL_MS };
            // On a failed refresh keep serving the last successful figures rather
            // than nothing — there is no local source to fall back on, since the
            // stored reviews are only a recent subset of what Google holds.
            return rating || ratingCache?.value || null;
        })
            .finally(() => {
            inFlightRating = null;
        });
    }
    return inFlightRating;
};
exports.fetchGooglePlaceRatingFromAPI = fetchGooglePlaceRatingFromAPI;
