"use strict";
/**
 * Pottery item tracking — the rules behind "Your Pottery Journey".
 *
 * Only Terracotta and Ceramic pieces are tracked: they are fired in the kiln
 * and stay in the studio for weeks afterwards, so the customer needs to be able
 * to follow them. Air-Dry pieces go home the same day, so those bookings are
 * simply marked collected by the admin and never get a tracking record.
 *
 * Everything here is pure — no database, no clock beyond the `now` that is
 * always passed in — so the timeline can be unit tested and so the scheduler,
 * the admin API and the public tracking endpoint all derive the same dates from
 * the same rules instead of each re-implementing them.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingToken = exports.computeTrackingDates = exports.estimateSkippedStageDate = exports.IMPLIED_STAGES = exports.getNextAutoStatus = exports.daysSince = exports.addDays = exports.isTrackableBooking = exports.resolveClayCategory = exports.STATUS_COPY = exports.STATUS_LABELS = exports.getJourneySteps = exports.PAINTING_WINDOW_DAYS = exports.DISCARD_WARNING_DAYS = exports.COLLECTION_DEADLINE_DAYS = exports.COLLECTION_WINDOW_DAYS = exports.READY_ESTIMATE_WINDOW_DAYS = exports.DELAYED_READY_DAY = exports.READY_DAY = exports.CLAY_TIMELINES = exports.ADMIN_SETTABLE_STATUSES = exports.DAY_MS = void 0;
const deriveClayType_1 = require("./deriveClayType");
exports.DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Statuses the admin sets by hand; everything else the scheduler moves.
 *
 * `painting` is on the list because the glazing session is a real event at the
 * studio rather than a date on a calendar — the piece is ready to paint when
 * the kiln says so, which is often before day 15. It is ceramic-only, and
 * `updateTrackingStatusUseCase` rejects it for a terracotta piece.
 */
exports.ADMIN_SETTABLE_STATUSES = [
    'painting',
    'delay',
    'ready',
    'collected',
    'discarded',
];
/**
 * Day offsets from the moment the admin marks a piece Created.
 *
 * Terracotta follows the studio's published timeline directly: drying days
 * 1-14, firing days 15-20, ready around day 21.
 *
 * Ceramic combines drying and firing into days 1-14 and opens painting on day
 * 15, so firing is placed mid-way through that combined window. Painting is a
 * session the customer books, so the piece is normally marked ready by hand as
 * soon as it is glazed and re-fired; day 21 is only the automatic fallback.
 */
exports.CLAY_TIMELINES = {
    terracotta: {
        label: 'Terracotta Clay',
        stages: [
            { status: 'drying', day: 1 },
            { status: 'firing', day: 15 },
            { status: 'ready', day: 21 },
        ],
    },
    ceramic: {
        label: 'Ceramic Clay',
        stages: [
            { status: 'drying', day: 1 },
            { status: 'firing', day: 8 },
            { status: 'painting', day: 15 },
            { status: 'ready', day: 21 },
        ],
    },
};
/** "after 3 weeks ... update the ready status automatically". */
exports.READY_DAY = 21;
/** A delayed piece needs the extra care described in the delay copy. */
exports.DELAYED_READY_DAY = 25;
/** The estimated ready date is shown as a week-wide window, not a single day. */
exports.READY_ESTIMATE_WINDOW_DAYS = 7;
/** "Estimated Collection Date: 1 week from the date the item becomes Ready". */
exports.COLLECTION_WINDOW_DAYS = 7;
/** "Collection Deadline: 1 month after the estimated collection date". */
exports.COLLECTION_DEADLINE_DAYS = 30;
/** The warning email goes out a week before the deadline. */
exports.DISCARD_WARNING_DAYS = 7;
/** Painting stays open for a month from the day the piece is ready to paint. */
exports.PAINTING_WINDOW_DAYS = 30;
/**
 * The steps drawn on the progress bar, in order.
 *
 * `delay` is deliberately absent: the mock-ups show a delayed piece still
 * sitting on the Firing step with an amber note underneath, rather than a step
 * of its own, so it is a flag on the journey and not a stop along it.
 */
const getJourneySteps = (category) => category === 'ceramic'
    ? ['created', 'drying', 'firing', 'painting', 'ready', 'collected']
    : ['created', 'drying', 'firing', 'ready', 'collected'];
exports.getJourneySteps = getJourneySteps;
exports.STATUS_LABELS = {
    created: 'Created',
    drying: 'Drying',
    firing: 'Firing',
    painting: 'Painting',
    delay: 'Delayed',
    ready: 'Ready for Collection',
    collected: 'Collected',
    discarded: 'Discarded',
};
/** Headline + body shown in the information box under the progress bar. */
exports.STATUS_COPY = {
    created: {
        title: 'Your pottery has been created',
        description: 'Your item has been created and is now being prepared for the drying process.',
    },
    drying: {
        title: 'Currently Drying',
        description: 'Your item is currently drying and will be ready for the next stage in approximately 2-3 weeks.',
    },
    firing: {
        title: 'Currently Being Fired',
        description: 'Your item has been dried, bisque fired, and glazed. It is now being glaze fired to make it durable and food-safe.',
    },
    painting: {
        title: 'Now Ready for Painting',
        description: 'Your ceramic piece has been dried and fired. It is now ready for painting. Add your personal touch and make it unique!',
    },
    delay: {
        title: 'Taking a Little Longer',
        description: 'We found a small crack in your piece, so we are giving it some extra care before firing. This may take a little longer than usual, but it helps ensure the best quality for your creation. Thank you for your patience!',
    },
    ready: {
        title: 'Ready for Collection',
        description: 'Your wonderful creation is ready for collection. We cannot wait for you to see the finished piece!',
    },
    collected: {
        title: 'Collected',
        description: 'Your creation has been packed and collected. We hope you loved your finished piece!',
    },
    discarded: {
        title: 'Discarded',
        description: 'This piece was not collected by the final collection date and has been discarded in line with our studio policy.',
    },
};
/**
 * Which tracked clay a booking is made of, or null when it needs no tracking.
 *
 * A booking can hold several packages (adults + kids, hand building + wheel).
 * They are always the same clay in practice, but if a booking ever mixes them
 * the fired clay wins, because that is the one that stays in the studio — and
 * Ceramic wins over Terracotta because its journey is the longer of the two.
 */
const resolveClayCategory = (items = []) => {
    const clayTypes = (items || []).map((item) => (0, deriveClayType_1.deriveClayType)(item?.optionTitle).toLowerCase());
    if (clayTypes.some((clay) => clay.includes('ceramic')))
        return 'ceramic';
    if (clayTypes.some((clay) => clay.includes('terracotta')))
        return 'terracotta';
    return null;
};
exports.resolveClayCategory = resolveClayCategory;
/** True when the booking's clay needs the studio journey. */
const isTrackableBooking = (items = []) => (0, exports.resolveClayCategory)(items) !== null;
exports.isTrackableBooking = isTrackableBooking;
const addDays = (from, days) => new Date(new Date(from).getTime() + days * exports.DAY_MS);
exports.addDays = addDays;
/** Whole days elapsed since `from`, floored — day 0 is the day of creation. */
const daysSince = (from, now = Date.now()) => Math.floor((now - new Date(from).getTime()) / exports.DAY_MS);
exports.daysSince = daysSince;
/**
 * The status the scheduler should move a piece to, or null to leave it alone.
 *
 * Stages are scanned from the end so a job that was down for a week catches up
 * in a single hop instead of walking the piece through every stage it missed.
 *
 * A delayed piece is never advanced automatically: the studio decides when the
 * extra care is finished, which is why `ready` is on the admin's list too.
 */
const getNextAutoStatus = (category, status, startedAt, now = Date.now()) => {
    if (status === 'delay' ||
        status === 'ready' ||
        status === 'collected' ||
        status === 'discarded') {
        return null;
    }
    const elapsed = (0, exports.daysSince)(startedAt, now);
    const { stages } = exports.CLAY_TIMELINES[category];
    const currentIndex = stages.findIndex((stage) => stage.status === status);
    // `created` is not in `stages`, so the scan starts at -1 and every stage is a
    // candidate — which is exactly right for a piece that has only just started.
    for (let index = stages.length - 1; index > currentIndex; index -= 1) {
        if (elapsed >= stages[index].day)
            return stages[index].status;
    }
    return null;
};
exports.getNextAutoStatus = getNextAutoStatus;
/**
 * Stages that happen to the piece whether or not anyone records them: a piece
 * marked Painting or Ready has necessarily been dried and fired. Painting is
 * not here — a ceramic piece marked ready without a session was never painted,
 * and a painting date would also trigger the painting invitation email.
 */
exports.IMPLIED_STAGES = ['drying', 'firing'];
/**
 * The date to show for an implied stage that was skipped over — by the studio
 * moving a piece on early, or the scheduler catching up in a single hop.
 *
 * It is the stage's scheduled day, but never later than the moment the piece
 * was seen past it (`cap`) and never earlier than the stage before (`floor`).
 */
const estimateSkippedStageDate = (category, status, startedAt, cap, floor) => {
    const stage = exports.CLAY_TIMELINES[category].stages.find((entry) => entry.status === status);
    const scheduled = stage ? (0, exports.addDays)(startedAt, stage.day).getTime() : new Date(cap).getTime();
    let time = Math.min(scheduled, new Date(cap).getTime());
    time = Math.max(time, new Date(floor ?? startedAt).getTime());
    return new Date(time);
};
exports.estimateSkippedStageDate = estimateSkippedStageDate;
/**
 * Every date the journey shows, derived from the two dates that are actually
 * stored: when tracking started and when the piece became ready.
 *
 * Keeping these derived rather than stored means a delay recorded after the
 * fact re-dates the estimate on its own, with no rows to migrate.
 */
const computeTrackingDates = (category, startedAt, options = {}) => {
    const readyDay = options.isDelayed ? exports.DELAYED_READY_DAY : exports.READY_DAY;
    const estimatedReadyFrom = (0, exports.addDays)(startedAt, readyDay);
    const estimatedReadyTo = (0, exports.addDays)(estimatedReadyFrom, exports.READY_ESTIMATE_WINDOW_DAYS);
    const paintingStage = exports.CLAY_TIMELINES[category].stages.find((stage) => stage.status === 'painting');
    const paintingWindowEnd = paintingStage
        ? (0, exports.addDays)(startedAt, paintingStage.day + exports.PAINTING_WINDOW_DAYS)
        : null;
    if (!options.readyAt) {
        return {
            estimatedReadyFrom,
            estimatedReadyTo,
            estimatedCollectionDate: null,
            collectionDeadline: null,
            discardWarningDate: null,
            paintingWindowEnd,
        };
    }
    const estimatedCollectionDate = (0, exports.addDays)(options.readyAt, exports.COLLECTION_WINDOW_DAYS);
    const collectionDeadline = (0, exports.addDays)(estimatedCollectionDate, exports.COLLECTION_DEADLINE_DAYS);
    const discardWarningDate = (0, exports.addDays)(collectionDeadline, -exports.DISCARD_WARNING_DAYS);
    return {
        estimatedReadyFrom,
        estimatedReadyTo,
        estimatedCollectionDate,
        collectionDeadline,
        discardWarningDate,
        paintingWindowEnd,
    };
};
exports.computeTrackingDates = computeTrackingDates;
/** Opaque, unguessable id for the tracking link mailed to the customer. */
const generateTrackingToken = () => {
    const random = () => Math.random().toString(36).slice(2, 12);
    return `${Date.now().toString(36)}${random()}${random()}`.toUpperCase();
};
exports.generateTrackingToken = generateTrackingToken;
