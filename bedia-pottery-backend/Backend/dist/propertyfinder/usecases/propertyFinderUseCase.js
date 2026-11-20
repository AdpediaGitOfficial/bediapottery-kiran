"use strict";
// import axios from 'axios';
// import { getAccessPropertyFinderToken } from '../authProperty/authProperty';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchListingsWithLocations = fetchListingsWithLocations;
exports.fetchSingleListing = fetchSingleListing;
// let cache: { [key: string]: { data: any; timestamp: number } } = {};
// export async function fetchPropertyFinderListings(params?: Record<string, any>) {
//   const cacheKey = JSON.stringify(params);
//   const now = Date.now();
//   // 1. Return cached response if less than 30 seconds old
//   if (cache[cacheKey] && now - cache[cacheKey].timestamp < 30_000) {
//     return cache[cacheKey].data;
//   }
//   try {
//     const token = await getAccessPropertyFinderToken();
//     const response = await axios.get('https://atlas.propertyfinder.com/v1/listings', {
//       headers: { Authorization: `Bearer ${token}` },
//       params,
//     });
//     cache[cacheKey] = { data: response.data, timestamp: now };
//     return response.data;
//   } catch (error: any) {
//     console.error('Error fetching listings:', error.response?.data || error.message);
//     throw new Error('Failed to fetch listings');
//   }
// }
const axios_1 = __importDefault(require("axios"));
const authProperty_1 = require("../authProperty/authProperty");
const cache = {};
const locationCache = {};
const singleListingCache = {};
// Delay helper
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Retry with exponential backoff
async function fetchLocation(id, token, retries = 3, baseDelay = 200) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await axios_1.default.get('https://atlas.propertyfinder.com/v1/locations', {
                headers: { Authorization: `Bearer ${token}` },
                params: { 'filter[id]': id, locale: 'en' },
            });
            if (res?.data?.data?.[0]) {
                locationCache[Number(res.data.data[0].id)] = res.data.data[0];
            }
            return; // ✅ success
        }
        catch (err) {
            console.warn(`⚠️ Attempt ${attempt} failed for location ${id}`);
            if (attempt < retries) {
                const wait = baseDelay * Math.pow(2, attempt - 1); // exponential backoff
                await delay(wait);
            }
        }
    }
    console.error(`❌ Failed to fetch location ${id} after ${retries} attempts`);
}
// Queue processor with concurrency limit
async function processQueue(ids, token, concurrency = 2) {
    let index = 0;
    async function worker() {
        while (index < ids.length) {
            const id = ids[index++];
            if (!locationCache[id]) {
                await fetchLocation(id, token);
            }
        }
    }
    // Start workers in parallel
    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
}
async function fetchListingsWithLocations(params) {
    const cacheKey = JSON.stringify(params);
    const now = Date.now();
    // ✅ Return cached listings if recent
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < 30000) {
        return cache[cacheKey].data;
    }
    try {
        const token = await (0, authProperty_1.getAccessPropertyFinderToken)();
        // 1️⃣ Fetch listings
        const listingsRes = await axios_1.default.get('https://atlas.propertyfinder.com/v1/listings', {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        const listings = listingsRes.data;
        // 2️⃣ Collect unique location IDs
        const locationIds = [
            ...new Set(listings?.results
                ?.map((l) => l?.location?.id)
                .filter((id) => id !== undefined && id !== null)),
        ];
        // 3️⃣ Process queue with concurrency limit
        const uncachedIds = locationIds.filter((id) => !locationCache[id]);
        if (uncachedIds.length > 0) {
            await processQueue(uncachedIds, token, 2); // concurrency = 2
        }
        // 4️⃣ Enrich listings with full location details
        const listingsWithFullLocations = listings?.results?.map((listing) => ({
            ...listing,
            locationDetails: locationCache[listing?.location?.id] || null,
        }));
        // 5️⃣ Return combined response
        const customisedRes = {
            results: listingsWithFullLocations,
            pagination: listings?.pagination,
        };
        // 6️⃣ Cache the response
        cache[cacheKey] = { data: customisedRes, timestamp: now };
        return customisedRes;
    }
    catch (error) {
        console.error('Error fetching listings with full locations:', error.response?.data || error.message);
        throw new Error('Failed to fetch listings with full locations');
    }
}
async function fetchSingleListing(listingId) {
    const cacheKey = `listing-${listingId}`;
    const now = Date.now();
    // 1️⃣ Return cached listing if recent
    if (singleListingCache[cacheKey] && now - singleListingCache[cacheKey].timestamp < 30000) {
        return singleListingCache[cacheKey].data;
    }
    try {
        const token = await (0, authProperty_1.getAccessPropertyFinderToken)();
        // 2️⃣ Fetch single listing
        const response = await axios_1.default.get(`https://atlas.propertyfinder.com/v1/listings?filter[ids]=${listingId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const listing = response.data?.results?.[0]; // ✅ take first item
        if (!listing)
            throw new Error('Listing not found');
        // 3️⃣ Fetch full location if missing
        const locationId = listing?.location?.id;
        if (locationId && !locationCache[locationId]) {
            await fetchLocation(locationId, token);
        }
        // 4️⃣ Attach full location details
        const listingWithFullLocation = {
            ...listing,
            locationDetails: locationId ? locationCache[locationId] : null,
        };
        // 5️⃣ Cache it
        singleListingCache[cacheKey] = {
            data: listingWithFullLocation,
            timestamp: now,
        };
        return listingWithFullLocation; // ✅ clean object, not array
    }
    catch (error) {
        console.error(`Error fetching single listing ${listingId}: `, error.response?.data || error.message);
        throw new Error(`Failed to fetch listing ${listingId}`);
    }
}
