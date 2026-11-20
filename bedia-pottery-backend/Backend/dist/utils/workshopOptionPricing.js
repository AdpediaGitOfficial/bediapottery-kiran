"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceWorkshopItem = exports.findExtraGuestOption = exports.findOptionById = exports.selectableOptions = exports.isExtraGuestOption = exports.isFamilyBooking = exports.FAMILY_WORKSHOP_TYPE = void 0;
const appError_1 = __importDefault(require("../common/appError"));
const httpStatus_1 = require("../common/httpStatus");
exports.FAMILY_WORKSHOP_TYPE = 'family';
/** True when a booking entry asked to be priced as a family party. */
const isFamilyBooking = (workshopType) => String(workshopType ?? '')
    .trim()
    .toLowerCase() === exports.FAMILY_WORKSHOP_TYPE;
exports.isFamilyBooking = isFamilyBooking;
// "1 Adult + 1 Child", "2 adults + 3 kids".
const INCLUDED_ADULTS = /(\d+)\s*adults?\b/i;
const INCLUDED_CHILDREN = /(\d+)\s*(?:child(?:ren)?|kids?)\b/i;
// The sibling options, named after the base option: "Air-Dry Clay Extra Adult".
const EXTRA_ADULT_TITLE = /\bextra\s*adults?\b/i;
const EXTRA_CHILD_TITLE = /\bextra\s*(?:child(?:ren)?|kids?)\b/i;
// Without a description to read, a family party is one adult and one child —
// which is what every base option in the workshop charges for today.
const DEFAULT_INCLUDED_ADULTS = 1;
const DEFAULT_INCLUDED_CHILDREN = 1;
const toCount = (value) => {
    const count = Number(value ?? 0);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};
const normalise = (value) => String(value ?? '').trim();
const isExtraAdultOption = (option) => EXTRA_ADULT_TITLE.test(normalise(option?.title));
const isExtraChildOption = (option) => EXTRA_CHILD_TITLE.test(normalise(option?.title));
const isExtraGuestOption = (option) => isExtraAdultOption(option) || isExtraChildOption(option);
exports.isExtraGuestOption = isExtraGuestOption;
/** Options a customer may choose — i.e. everything except the extra-guest ones. */
const selectableOptions = (options) => (options || []).filter((option) => !(0, exports.isExtraGuestOption)(option));
exports.selectableOptions = selectableOptions;
const findOptionById = (options, optionId) => (options || []).find((option) => String(option._id) === String(optionId));
exports.findOptionById = findOptionById;
/**
 * The extra-guest option that belongs to a base option.
 *
 * Matched on the base title first — "Air-Dry Clay" + "Extra Adult" — since that
 * is how the studio names them, then on `clayTypeId`, which is how the document
 * groups them. Either way the price comes from the right clay type: Air-Dry
 * 235/160, Terracotta 245/175, Ceramic 275/200.
 */
const findExtraGuestOption = (options, baseOption, guest) => {
    const matchesGuest = guest === 'adult' ? isExtraAdultOption : isExtraChildOption;
    const baseTitle = normalise(baseOption?.title).toLowerCase();
    const clayTypeId = normalise(baseOption?.clayTypeId);
    const candidates = (options || []).filter(matchesGuest);
    const byTitle = candidates.find((option) => normalise(option.title).toLowerCase().startsWith(baseTitle));
    if (byTitle)
        return byTitle;
    return candidates.find((option) => normalise(option.clayTypeId) === clayTypeId);
};
exports.findExtraGuestOption = findExtraGuestOption;
/**
 * The party a base option's price covers, read from its `priceDescription`.
 * Falls back to one adult + one child, which is what the workshop charges for.
 */
const includedParty = (option) => {
    const description = normalise(option?.priceDescription);
    const adults = INCLUDED_ADULTS.exec(description);
    const children = INCLUDED_CHILDREN.exec(description);
    if (!adults && !children) {
        return { adults: DEFAULT_INCLUDED_ADULTS, children: DEFAULT_INCLUDED_CHILDREN };
    }
    return {
        adults: adults ? toCount(Number(adults[1])) : 0,
        children: children ? toCount(Number(children[1])) : 0,
    };
};
/**
 * Whether this really is a family option, so a payload claiming
 * `workshopType: 'family'` cannot talk an ordinary workshop into party pricing.
 * It qualifies if its description names a party, or if the workshop carries
 * extra-guest options for it.
 */
const looksLikeFamilyOption = (options, option) => {
    const description = normalise(option?.priceDescription);
    if (INCLUDED_ADULTS.test(description) && INCLUDED_CHILDREN.test(description))
        return true;
    return Boolean((0, exports.findExtraGuestOption)(options, option, 'adult') ||
        (0, exports.findExtraGuestOption)(options, option, 'child'));
};
const perHeadPrice = (option, people) => {
    const subtotal = option.price * people;
    return {
        price: option.price,
        subtotal,
        breakdown: [
            {
                label: normalise(option.title),
                unitPrice: option.price,
                quantity: people,
                amount: subtotal,
            },
        ],
    };
};
/**
 * Prices one booking line against the workshop's own options. Prices are never
 * read from the payload — both carts live in the browser, so the request is
 * untrusted; only the option, the head count and the split come from it.
 *
 * `workshopType: 'family'` charges the base price once, however many of the
 * included seats the family uses, plus an extra-guest option for every adult and
 * child past the included counts. 2 adults + 2 children on Air-Dry therefore
 * costs 400 + 235 + 160 = AED 795, not 4 × 400.
 */
const priceWorkshopItem = (options, item, workshopType) => {
    const option = (0, exports.findOptionById)(options, item.optionId);
    if (!option) {
        throw new appError_1.default('Invalid option selected', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const people = toCount(item.people);
    if ((0, exports.isExtraGuestOption)(option)) {
        throw new appError_1.default(`"${normalise(option.title)}" prices an extra guest and cannot be booked on its own`, httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (!(0, exports.isFamilyBooking)(workshopType) || !looksLikeFamilyOption(options, option)) {
        return perHeadPrice(option, people);
    }
    const included = includedParty(option);
    const givenAdults = toCount(item.adult);
    const givenChildren = toCount(item.child);
    // The front end sends the split; if it is missing, the included seats are
    // assumed filled first and the rest charged as children — the cheaper rate, so
    // a missing split never overcharges a customer.
    const hasSplit = givenAdults + givenChildren > 0;
    const adults = hasSplit ? givenAdults : Math.min(included.adults, people);
    const children = hasSplit ? givenChildren : people - adults;
    if (hasSplit && adults + children !== people) {
        throw new appError_1.default('Adults and children must add up to the number of guests', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const extras = [
        { guest: 'adult', quantity: Math.max(0, adults - included.adults) },
        { guest: 'child', quantity: Math.max(0, children - included.children) },
    ];
    const breakdown = [
        {
            label: option.priceDescription
                ? `${normalise(option.title)} (${normalise(option.priceDescription)})`
                : normalise(option.title),
            unitPrice: option.price,
            quantity: 1,
            amount: option.price,
        },
    ];
    let subtotal = option.price;
    for (const extra of extras) {
        if (extra.quantity === 0)
            continue;
        const extraOption = (0, exports.findExtraGuestOption)(options, option, extra.guest);
        // Configuration, not customer input: the booking brings guests the party
        // price does not cover and the studio has not priced them. Refusing beats
        // charging for them at nothing.
        if (!extraOption) {
            throw new appError_1.default(`This workshop has no extra ${extra.guest} price for ${normalise(option.title)}`, httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const amount = extraOption.price * extra.quantity;
        subtotal += amount;
        breakdown.push({
            label: hasSplit ? normalise(extraOption.title) : `${normalise(extraOption.title)} (assumed)`,
            unitPrice: extraOption.price,
            quantity: extra.quantity,
            amount,
        });
    }
    return { price: option.price, subtotal, breakdown };
};
exports.priceWorkshopItem = priceWorkshopItem;
