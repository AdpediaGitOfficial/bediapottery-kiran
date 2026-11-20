"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const potteryTracking_1 = require("./potteryTracking");
const START = new Date('2026-06-02T10:00:00.000Z');
/** `now` at exactly N days past the moment tracking started. */
const dayN = (day) => START.getTime() + day * potteryTracking_1.DAY_MS;
describe('resolveClayCategory', () => {
    it('recognises the two fired clays from the package title', () => {
        expect((0, potteryTracking_1.resolveClayCategory)([{ optionTitle: 'Terracotta Clay - Adults' }])).toBe('terracotta');
        expect((0, potteryTracking_1.resolveClayCategory)([{ optionTitle: 'Ceramic Clay - Kids' }])).toBe('ceramic');
    });
    it('leaves air-dry bookings untracked', () => {
        expect((0, potteryTracking_1.resolveClayCategory)([{ optionTitle: 'Air-Dry Clay - Kids' }])).toBeNull();
        expect((0, potteryTracking_1.isTrackableBooking)([{ optionTitle: 'Air-Dry Clay - Kids' }])).toBe(false);
    });
    it('picks the longer journey when a booking mixes clays', () => {
        expect((0, potteryTracking_1.resolveClayCategory)([
            { optionTitle: 'Terracotta Clay - Adults' },
            { optionTitle: 'Ceramic Clay - Kids' },
        ])).toBe('ceramic');
    });
    it('handles a booking with no items at all', () => {
        expect((0, potteryTracking_1.resolveClayCategory)([])).toBeNull();
        expect((0, potteryTracking_1.resolveClayCategory)(undefined)).toBeNull();
    });
});
describe('getJourneySteps', () => {
    it('adds painting for ceramic only', () => {
        expect((0, potteryTracking_1.getJourneySteps)('ceramic')).toContain('painting');
        expect((0, potteryTracking_1.getJourneySteps)('terracotta')).not.toContain('painting');
    });
});
describe('getNextAutoStatus — terracotta', () => {
    it('holds at created for the first day', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'created', START, dayN(0))).toBeNull();
    });
    it('starts drying on day 1 and firing on day 15', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'created', START, dayN(1))).toBe('drying');
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'drying', START, dayN(15))).toBe('firing');
    });
    it('turns ready on its own after three weeks', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'firing', START, dayN(20))).toBeNull();
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'firing', START, dayN(21))).toBe('ready');
    });
    it('skips straight to the current stage when the job has been down', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'created', START, dayN(16))).toBe('firing');
    });
});
describe('getNextAutoStatus — ceramic', () => {
    it('runs drying, firing and painting inside the published windows', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('ceramic', 'created', START, dayN(1))).toBe('drying');
        expect((0, potteryTracking_1.getNextAutoStatus)('ceramic', 'drying', START, dayN(8))).toBe('firing');
        expect((0, potteryTracking_1.getNextAutoStatus)('ceramic', 'firing', START, dayN(15))).toBe('painting');
        expect((0, potteryTracking_1.getNextAutoStatus)('ceramic', 'painting', START, dayN(21))).toBe('ready');
    });
});
describe('getNextAutoStatus — statuses the studio owns', () => {
    it('never advances a delayed piece, however long it has been', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'delay', START, dayN(60))).toBeNull();
    });
    it('never moves a piece that has finished its journey', () => {
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'ready', START, dayN(60))).toBeNull();
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'collected', START, dayN(60))).toBeNull();
        expect((0, potteryTracking_1.getNextAutoStatus)('terracotta', 'discarded', START, dayN(60))).toBeNull();
    });
});
describe('computeTrackingDates', () => {
    it('estimates a week-wide ready window three weeks out', () => {
        const dates = (0, potteryTracking_1.computeTrackingDates)('terracotta', START);
        expect(dates.estimatedReadyFrom.getTime()).toBe(dayN(21));
        expect(dates.estimatedReadyTo.getTime()).toBe(dayN(28));
    });
    it('pushes the estimate out when the piece is delayed', () => {
        const dates = (0, potteryTracking_1.computeTrackingDates)('terracotta', START, { isDelayed: true });
        expect(dates.estimatedReadyFrom.getTime()).toBe(dayN(25));
        expect(dates.estimatedReadyTo.getTime()).toBe(dayN(32));
    });
    it('has no collection dates until the piece is actually ready', () => {
        const dates = (0, potteryTracking_1.computeTrackingDates)('terracotta', START);
        expect(dates.estimatedCollectionDate).toBeNull();
        expect(dates.collectionDeadline).toBeNull();
        expect(dates.discardWarningDate).toBeNull();
    });
    it('counts collection a week from ready and the deadline a month after that', () => {
        const readyAt = new Date(dayN(21));
        const dates = (0, potteryTracking_1.computeTrackingDates)('terracotta', START, { readyAt });
        expect(dates.estimatedCollectionDate.getTime()).toBe(dayN(28));
        expect(dates.collectionDeadline.getTime()).toBe(dayN(58));
        expect(dates.discardWarningDate.getTime()).toBe(dayN(51));
    });
    it('opens a month-long painting window for ceramic and none for terracotta', () => {
        expect((0, potteryTracking_1.computeTrackingDates)('ceramic', START).paintingWindowEnd.getTime()).toBe(dayN(45));
        expect((0, potteryTracking_1.computeTrackingDates)('terracotta', START).paintingWindowEnd).toBeNull();
    });
});
