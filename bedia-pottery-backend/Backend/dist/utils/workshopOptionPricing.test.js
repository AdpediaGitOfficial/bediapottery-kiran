"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workshopOptionPricing_1 = require("./workshopOptionPricing");
const AIR_DRY = '698ed9075bed39f35db8991a';
const CERAMIC = '698ed9075bed39f35db8991b';
const TERRACOTTA = '698ed9075bed39f35db8991c';
/**
 * The Family Pottery Workshop's options, copied from the stored document —
 * including the trailing space in "Air-Dry Clay " and the empty
 * priceDescription on every extra-guest option.
 */
const familyOptions = [
    {
        _id: '6aac0d5e2880307849d72184',
        clayTypeId: AIR_DRY,
        title: 'Air-Dry Clay ',
        price: 400,
        priceDescription: '1 Adult + 1 Child',
    },
    {
        _id: '6aac0d5e2880307849d72185',
        clayTypeId: AIR_DRY,
        title: 'Air-Dry Clay Extra Child',
        price: 160,
        priceDescription: '',
    },
    {
        _id: '6aac0d5e2880307849d72186',
        clayTypeId: AIR_DRY,
        title: 'Air-Dry Clay Extra Adult',
        price: 235,
        priceDescription: '',
    },
    {
        _id: '6aac0d5e2880307849d72187',
        clayTypeId: TERRACOTTA,
        title: 'Terracotta Clay',
        price: 450,
        priceDescription: '1 Adult + 1 Child',
    },
    {
        _id: '6aac0d5e2880307849d72188',
        clayTypeId: TERRACOTTA,
        title: 'Terracotta Clay Extra Child',
        price: 175,
        priceDescription: '',
    },
    {
        _id: '6aac0d5e2880307849d72189',
        clayTypeId: TERRACOTTA,
        title: 'Terracotta Clay Extra Adult',
        price: 245,
        priceDescription: '',
    },
    {
        _id: '6aac0d5e2880307849d7218a',
        clayTypeId: CERAMIC,
        title: 'Ceramic Clay',
        price: 500,
        priceDescription: '1 Adult + 1 Child',
    },
    {
        _id: '6aac0d5e2880307849d7218b',
        clayTypeId: CERAMIC,
        title: 'Ceramic Clay Extra Child',
        price: 200,
        priceDescription: '',
    },
    {
        _id: '6aac0d5e2880307849d7218c',
        clayTypeId: CERAMIC,
        title: 'Ceramic Clay Extra Adult',
        price: 275,
        priceDescription: '',
    },
];
const AIR_DRY_BASE = '6aac0d5e2880307849d72184';
const TERRACOTTA_BASE = '6aac0d5e2880307849d72187';
const CERAMIC_BASE = '6aac0d5e2880307849d7218a';
// An ordinary workshop: no party price, no extra-guest options.
const perHeadOptions = [
    {
        _id: 'opt-solo',
        clayTypeId: AIR_DRY,
        title: 'Air-Dry Clay',
        price: 220,
        priceDescription: 'Per Adult',
    },
];
describe('isFamilyBooking', () => {
    it('recognises the family type however it is cased or padded', () => {
        expect((0, workshopOptionPricing_1.isFamilyBooking)('family')).toBe(true);
        expect((0, workshopOptionPricing_1.isFamilyBooking)('Family')).toBe(true);
        expect((0, workshopOptionPricing_1.isFamilyBooking)(' FAMILY ')).toBe(true);
    });
    it('is false for anything else', () => {
        expect((0, workshopOptionPricing_1.isFamilyBooking)('pottery')).toBe(false);
        expect((0, workshopOptionPricing_1.isFamilyBooking)(undefined)).toBe(false);
        expect((0, workshopOptionPricing_1.isFamilyBooking)(null)).toBe(false);
    });
});
describe('family booking', () => {
    it('charges the party price once for 1 adult + 1 child', () => {
        const { price, subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 2, adult: 1, child: 1 }, 'family');
        // The bug this replaces charged 400 × 2 = 800.
        expect(price).toBe(400);
        expect(subtotal).toBe(400);
    });
    it('adds the extra adult and extra child prices of the same clay type', () => {
        const { subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 4, adult: 2, child: 2 }, 'family');
        // 400 base + 235 extra adult + 160 extra child.
        expect(subtotal).toBe(795);
    });
    it('prices terracotta and ceramic from their own extras', () => {
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: TERRACOTTA_BASE, people: 5, adult: 2, child: 3 }, 'family').subtotal).toBe(1045);
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: CERAMIC_BASE, people: 3, adult: 1, child: 2 }, 'family').subtotal).toBe(700);
    });
    it('charges several extra guests at the per-guest price', () => {
        const { subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 6, adult: 2, child: 4 }, 'family');
        // 400 + (1 × 235) + (3 × 160).
        expect(subtotal).toBe(1115);
    });
    it('still charges the full party price when an included seat goes unused', () => {
        const { subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 2, adult: 2, child: 0 }, 'family');
        // Not reduced for a family that brings no child; the second adult is the
        // one extra guest.
        expect(subtotal).toBe(635);
    });
    it('returns a breakdown that explains the charge', () => {
        const { breakdown } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 4, adult: 2, child: 2 }, 'family');
        expect(breakdown).toEqual([
            { label: 'Air-Dry Clay (1 Adult + 1 Child)', unitPrice: 400, quantity: 1, amount: 400 },
            { label: 'Air-Dry Clay Extra Adult', unitPrice: 235, quantity: 1, amount: 235 },
            { label: 'Air-Dry Clay Extra Child', unitPrice: 160, quantity: 1, amount: 160 },
        ]);
    });
    it('refuses a split that does not add up to the head count', () => {
        expect(() => (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 4, adult: 1, child: 1 }, 'family')).toThrow(/add up to the number of guests/i);
    });
    it('refuses an extra-guest option booked on its own', () => {
        expect(() => (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: '6aac0d5e2880307849d72186', people: 1, adult: 1 }, 'family')).toThrow(/cannot be booked on its own/i);
    });
    it('refuses extra guests the studio has not priced', () => {
        // Base option alone — the extras were never created.
        expect(() => (0, workshopOptionPricing_1.priceWorkshopItem)([familyOptions[0]], { optionId: AIR_DRY_BASE, people: 3, adult: 2, child: 1 }, 'family')).toThrow(/no extra adult price/i);
    });
    it('reads a larger included party out of priceDescription', () => {
        const options = [
            { ...familyOptions[0], priceDescription: '2 Adults + 2 Children' },
            familyOptions[1],
            familyOptions[2],
        ];
        // The party now covers all four, so there is nothing extra to add.
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(options, { optionId: AIR_DRY_BASE, people: 4, adult: 2, child: 2 }, 'family').subtotal).toBe(400);
    });
});
/** Until the front end sends adult/child, the split has to be assumed. */
describe('family booking with no split in the payload', () => {
    it('charges a party of two exactly the party price', () => {
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 2 }, 'family').subtotal).toBe(400);
    });
    it('charges a single guest the party price, not a part of it', () => {
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 1 }, 'family').subtotal).toBe(400);
    });
    it('charges extra guests at the cheaper child rate, marked as assumed', () => {
        const { subtotal, breakdown } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: AIR_DRY_BASE, people: 4 }, 'family');
        // 400 + (2 × 160) — under-collects rather than overcharging a customer.
        expect(subtotal).toBe(720);
        expect(breakdown[1].label).toBe('Air-Dry Clay Extra Child (assumed)');
    });
});
describe('without the family flag', () => {
    it('prices the same option per head, exactly as before', () => {
        const { subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, {
            optionId: AIR_DRY_BASE,
            people: 2,
            adult: 1,
            child: 1,
        });
        expect(subtotal).toBe(800);
    });
    it('prices an ordinary workshop per head', () => {
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(perHeadOptions, { optionId: 'opt-solo', people: 3 }).subtotal).toBe(660);
    });
    it('ignores a family flag an ordinary workshop cannot honour', () => {
        // No party description and no extra-guest options, so the flag cannot talk
        // this workshop into charging one seat for three guests.
        expect((0, workshopOptionPricing_1.priceWorkshopItem)(perHeadOptions, { optionId: 'opt-solo', people: 3, adult: 3, child: 0 }, 'family').subtotal).toBe(660);
    });
    it('rejects an unknown option', () => {
        expect(() => (0, workshopOptionPricing_1.priceWorkshopItem)(familyOptions, { optionId: 'nope', people: 1 })).toThrow(/invalid option/i);
    });
});
describe('finding the extra-guest options', () => {
    it('matches them to their base option by title', () => {
        const base = familyOptions[0];
        expect((0, workshopOptionPricing_1.findExtraGuestOption)(familyOptions, base, 'adult')._id).toBe('6aac0d5e2880307849d72186');
        expect((0, workshopOptionPricing_1.findExtraGuestOption)(familyOptions, base, 'child')._id).toBe('6aac0d5e2880307849d72185');
    });
    it('falls back to the clay type when the titles do not line up', () => {
        const base = { _id: 'base', clayTypeId: TERRACOTTA, title: 'Red Clay', price: 450 };
        expect((0, workshopOptionPricing_1.findExtraGuestOption)(familyOptions, base, 'adult')._id).toBe('6aac0d5e2880307849d72189');
    });
    it('never returns another clay type as a fallback', () => {
        const base = { _id: 'base', clayTypeId: 'unknown-clay', title: 'Mystery Clay', price: 400 };
        expect((0, workshopOptionPricing_1.findExtraGuestOption)(familyOptions, base, 'adult')).toBeUndefined();
    });
    it('recognises an extra-guest option by title', () => {
        expect((0, workshopOptionPricing_1.isExtraGuestOption)(familyOptions[1])).toBe(true);
        expect((0, workshopOptionPricing_1.isExtraGuestOption)(familyOptions[2])).toBe(true);
        expect((0, workshopOptionPricing_1.isExtraGuestOption)(familyOptions[0])).toBe(false);
    });
    it('leaves them out of the options a customer chooses from', () => {
        expect((0, workshopOptionPricing_1.selectableOptions)(familyOptions).map((option) => option.title)).toEqual([
            'Air-Dry Clay ',
            'Terracotta Clay',
            'Ceramic Clay',
        ]);
    });
});
