"use strict";
/**
 * Item tracking use cases — the admin actions, the public tracking page and
 * the scheduled pass that moves pieces along on their own.
 *
 * The timeline rules themselves live in utils/potteryTracking; this file is
 * about persistence, emails and the guards around who may do what.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTrackingAutomationUseCase = exports.getTrackingByTokenUseCase = exports.buildTrackingSummary = exports.markBookingCollectedUseCase = exports.updateTrackingStatusUseCase = exports.updateTrackingItemCodesUseCase = exports.startBookingTrackingUseCase = exports.dispatchTrackingEmails = exports.buildTrackingUrl = void 0;
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const objectIdParser_1 = require("../../utils/objectIdParser");
const potteryTracking_1 = require("../../utils/potteryTracking");
const workshopRepo_1 = require("../repos/workshopRepo");
const potteryTrackingMailService_1 = require("../../services/potteryTrackingMailService");
/** Where each status writes its timestamp. `created` uses `startedAt`. */
const STATUS_TIMESTAMP_FIELD = {
    drying: 'dryingAt',
    firing: 'firingAt',
    painting: 'paintingAt',
    delay: 'delayedAt',
    ready: 'readyAt',
    collected: 'collectedAt',
    discarded: 'discardedAt',
};
const STUDIO_MAP_URL = 'https://www.google.com/maps/place/Bedia+Pottery+%7C+Adults+%26+Kids+Birthday+Party+Packages+%2B+Fun+Beginners+Workshop/@25.1393368,55.2263525,17z/data=!4m6!3m5!1s0x3e5f69be5e716b71:0x79d624863c4c5812!8m2!3d25.1396865!4d55.2286163!16s%2Fg%2F11vdldm6g6';
/** The "Need help?" block on the tracking page. */
const STUDIO_CONTACT = {
    phone: '+971 56 956 9088',
    whatsappUrl: 'https://wa.me/message/GCWBT42WZ2TOP1',
    email: 'booking@bediapottery.ae',
};
/**
 * The tracking link mailed to the customer.
 *
 * Pieces are only ever made at the pottery studio, so this is always the
 * pottery site; FRONTEND_URL is the fallback for a deployment that has not set
 * POTTERY_FRONTEND_URL yet, matching how the Stripe redirects resolve.
 */
const buildTrackingUrl = (token) => {
    const base = (process.env.POTTERY_FRONTEND_URL || process.env.FRONTEND_URL || '');
    return `${base.replace(/\/+$/, '')}/tracking-order?ref=${encodeURIComponent(token)}`;
};
exports.buildTrackingUrl = buildTrackingUrl;
/** Item codes arrive as free text from the dashboard; normalise before storing. */
const normaliseItemCodes = (itemCodes) => {
    const raw = Array.isArray(itemCodes)
        ? itemCodes
        : String(itemCodes ?? '')
            .split(/[\n,]/)
            .map((code) => code.trim());
    const cleaned = raw
        .map((code) => String(code ?? '')
        .trim()
        .toUpperCase())
        .filter((code) => code.length > 0);
    // A piece is identified by its code, so the same one listed twice is a typo
    // rather than two pieces.
    return Array.from(new Set(cleaned));
};
const assertBookingId = (bookingId) => {
    if (!(0, objectIdParser_1.ObjectID)(bookingId)) {
        throw new appError_1.default('Invalid booking reference', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
};
/** Retries because a token collision, while near-impossible, must not silently share a link. */
const issueTrackingToken = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const token = (0, potteryTracking_1.generateTrackingToken)();
        if (!(await (0, workshopRepo_1.trackingTokenExistsRepo)(token)))
            return token;
    }
    throw new appError_1.default('Could not allocate a tracking link', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
};
/** Where a status sits on the journey bar — a delay holds the piece at firing. */
const journeyPosition = (status) => status === 'delay' ? 'firing' : status === 'discarded' ? 'ready' : status;
/**
 * Dates drying and firing when the piece moves past them without stopping —
 * the studio marking it Painting early, or the scheduler catching up in one
 * hop — so the journey never shows a completed step with no date.
 */
const backfillImpliedStageDates = (tracking, status, now) => {
    const category = tracking.clayCategory;
    if (!tracking.startedAt || !potteryTracking_1.CLAY_TIMELINES[category])
        return;
    const journey = (0, potteryTracking_1.getJourneySteps)(category);
    const position = journey.indexOf(journeyPosition(status));
    if (position < 0)
        return;
    let floor = tracking.startedAt;
    for (const step of journey.slice(0, position)) {
        const field = STATUS_TIMESTAMP_FIELD[step];
        if (!field)
            continue;
        if (!tracking[field] && potteryTracking_1.IMPLIED_STAGES.includes(step)) {
            tracking[field] = (0, potteryTracking_1.estimateSkippedStageDate)(category, step, tracking.startedAt, now, floor);
        }
        if (tracking[field])
            floor = tracking[field];
    }
};
/**
 * Records a status change on the booking document in memory.
 *
 * Timestamps are only ever written once: re-entering a stage (a piece marked
 * delayed and then put back into firing) keeps the original date, which is what
 * the journey shows against each step.
 */
const applyStatusChange = (booking, status, by, now, note) => {
    const tracking = booking.tracking;
    tracking.status = status;
    backfillImpliedStageDates(tracking, status, now);
    const field = STATUS_TIMESTAMP_FIELD[status];
    if (field && !tracking[field])
        tracking[field] = now;
    // Sticky, so the later estimate survives the piece moving on to ready.
    if (status === 'delay') {
        tracking.isDelayed = true;
        if (note)
            tracking.delayNote = note;
    }
    if (!Array.isArray(tracking.history))
        tracking.history = [];
    tracking.history.push({ status, at: now, by, note });
    // `tracking` is a nested path rather than a sub-document, so deep writes are
    // flagged explicitly instead of relying on change detection reaching them.
    booking.markModified?.('tracking');
    // A collected piece closes the booking; a discarded one stays `completed`,
    // since the workshop did happen and only the pickup never did.
    if (status === 'collected')
        booking.bookingStatus = 'collected';
};
/**
 * Sends whichever of the customer emails is now due and has not gone out yet.
 *
 * Driven by the stage timestamps rather than the current status, so a piece
 * that crosses two stages in one scheduler pass still gets both emails, a piece
 * marked ready without ever being painted correctly gets neither the painting
 * invitation nor a duplicate, and a piece that was delayed and then fixed still
 * has its delay notice on record once it moves on to ready.
 *
 * Returns true when a flag was written and the caller needs to save.
 */
const dispatchTrackingEmails = async (booking, now = new Date()) => {
    const tracking = booking?.tracking;
    if (!tracking?.startedAt)
        return false;
    if (!tracking.emails)
        tracking.emails = {};
    const flagSent = (field) => {
        tracking.emails[field] = now;
        booking.markModified?.('tracking.emails');
    };
    const dates = (0, potteryTracking_1.computeTrackingDates)(tracking.clayCategory, tracking.startedAt, {
        isDelayed: tracking.isDelayed,
        readyAt: tracking.readyAt,
    });
    let changed = false;
    if (!tracking.emails.createdSentAt) {
        await (0, potteryTrackingMailService_1.sendTrackingLinkMail)({ booking, trackingUrl: (0, exports.buildTrackingUrl)(tracking.token) });
        flagSent('createdSentAt');
        changed = true;
    }
    if (tracking.clayCategory === 'ceramic' &&
        tracking.paintingAt &&
        !tracking.emails.paintingSentAt) {
        await (0, potteryTrackingMailService_1.sendPaintingReadyMail)({ booking });
        flagSent('paintingSentAt');
        changed = true;
    }
    // Sent on the studio's delay action. `delayedAt` is written once, so a piece
    // delayed a second time does not mail the customer twice; the revised
    // estimate is the same either way.
    if (tracking.delayedAt && !tracking.emails.delaySentAt) {
        await (0, potteryTrackingMailService_1.sendDelayMail)({
            booking,
            estimatedReadyFrom: dates.estimatedReadyFrom,
            estimatedReadyTo: dates.estimatedReadyTo,
            trackingUrl: (0, exports.buildTrackingUrl)(tracking.token),
        });
        flagSent('delaySentAt');
        changed = true;
    }
    if (tracking.readyAt && !tracking.emails.readySentAt) {
        await (0, potteryTrackingMailService_1.sendReadyForCollectionMail)({
            booking,
            estimatedCollectionDate: dates.estimatedCollectionDate,
        });
        flagSent('readySentAt');
        changed = true;
    }
    // Only worth warning about a piece still waiting to be picked up.
    const awaitingCollection = tracking.status === 'ready';
    if (awaitingCollection &&
        dates.discardWarningDate &&
        now.getTime() >= dates.discardWarningDate.getTime() &&
        !tracking.emails.discardWarningSentAt) {
        await (0, potteryTrackingMailService_1.sendCollectionWarningMail)({ booking, collectionDeadline: dates.collectionDeadline });
        flagSent('discardWarningSentAt');
        changed = true;
    }
    return changed;
};
exports.dispatchTrackingEmails = dispatchTrackingEmails;
/* ---------------- admin actions ---------------- */
/**
 * "Workshop completed" — the admin's one action at the end of a Terracotta or
 * Ceramic session. It closes the booking as completed, records the codes
 * written on the pieces, opens the journey at Created and mails the link.
 *
 * Item codes are required: the ready-for-collection email asks the customer to
 * quote one at reception, so a journey started without them would produce an
 * email with a blank code block.
 */
const startBookingTrackingUseCase = async ({ bookingId, itemCodes, }) => {
    assertBookingId(bookingId);
    const booking = await (0, workshopRepo_1.getBookingForTrackingRepo)(bookingId);
    if (!booking)
        throw new appError_1.default('No Workshop Booking Found', httpStatus_1.HttpStatus.NOT_FOUND);
    if (booking.tracking?.status) {
        throw new appError_1.default('Tracking has already been started for this booking', httpStatus_1.HttpStatus.CONFLICT);
    }
    const clayCategory = (0, potteryTracking_1.resolveClayCategory)(booking.items);
    if (!clayCategory) {
        throw new appError_1.default('This booking is not Terracotta or Ceramic — mark it collected instead', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const codes = normaliseItemCodes(itemCodes);
    if (!codes.length) {
        throw new appError_1.default('At least one item code is required', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const now = new Date();
    booking.tracking = {
        status: 'created',
        clayCategory,
        itemCodes: codes,
        token: await issueTrackingToken(),
        startedAt: now,
        isDelayed: false,
        emails: {},
        history: [{ status: 'created', at: now, by: 'admin' }],
    };
    booking.bookingStatus = 'completed';
    await booking.save();
    // Saved before the email so a mail failure cannot lose the journey; the
    // scheduler retries an unsent link on its next pass.
    if (await (0, exports.dispatchTrackingEmails)(booking, now)) {
        await booking.save();
    }
    return (0, exports.buildTrackingSummary)(booking);
};
exports.startBookingTrackingUseCase = startBookingTrackingUseCase;
/** Codes can be corrected after the fact — a mistyped code reaches reception. */
const updateTrackingItemCodesUseCase = async ({ bookingId, itemCodes, }) => {
    assertBookingId(bookingId);
    const booking = await (0, workshopRepo_1.getBookingForTrackingRepo)(bookingId);
    if (!booking?.tracking?.status) {
        throw new appError_1.default('Tracking has not been started for this booking', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const codes = normaliseItemCodes(itemCodes);
    if (!codes.length) {
        throw new appError_1.default('At least one item code is required', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    booking.tracking.itemCodes = codes;
    await booking.save();
    return (0, exports.buildTrackingSummary)(booking);
};
exports.updateTrackingItemCodesUseCase = updateTrackingItemCodesUseCase;
/**
 * The statuses the studio owns: painting, delay, ready, collected and
 * discarded.
 *
 * Drying and firing are never set from here — they are functions of elapsed
 * time, and letting the dashboard set them would let the stored status and the
 * timeline disagree. Painting is different: it opens the session the customer
 * comes in to book, and only the studio knows when the piece is actually out of
 * the kiln and ready to be glazed. The scheduler still opens it on day 15 for
 * anything the studio has not got to first.
 */
const updateTrackingStatusUseCase = async ({ bookingId, status, note, }) => {
    assertBookingId(bookingId);
    if (!potteryTracking_1.ADMIN_SETTABLE_STATUSES.includes(status)) {
        throw new appError_1.default(`Status must be one of: ${potteryTracking_1.ADMIN_SETTABLE_STATUSES.join(', ')}`, httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const booking = await (0, workshopRepo_1.getBookingForTrackingRepo)(bookingId);
    if (!booking?.tracking?.status) {
        throw new appError_1.default('Tracking has not been started for this booking', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const current = booking.tracking.status;
    if (current === status) {
        throw new appError_1.default(`This piece is already marked ${potteryTracking_1.STATUS_LABELS[status]}`, httpStatus_1.HttpStatus.CONFLICT);
    }
    if (current === 'collected' || current === 'discarded') {
        throw new appError_1.default(`A ${potteryTracking_1.STATUS_LABELS[current].toLowerCase()} piece cannot change status`, httpStatus_1.HttpStatus.CONFLICT);
    }
    if (status === 'collected' && current !== 'ready') {
        throw new appError_1.default('Only a piece that is ready for collection can be collected', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Terracotta is fired and glazed in one pass, so it has no painting stage to
    // open — its journey goes straight from firing to ready.
    if (status === 'painting' && booking.tracking.clayCategory !== 'ceramic') {
        throw new appError_1.default('Only a ceramic piece has a painting stage', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Painting comes before ready on the journey, so opening it again afterwards
    // would walk the piece backwards past a stage the customer has been emailed
    // about.
    if (status === 'painting' && current === 'ready') {
        throw new appError_1.default('This piece is already ready for collection — painting has closed', httpStatus_1.HttpStatus.CONFLICT);
    }
    const now = new Date();
    applyStatusChange(booking, status, 'admin', now, note);
    await booking.save();
    if (await (0, exports.dispatchTrackingEmails)(booking, now)) {
        await booking.save();
    }
    return (0, exports.buildTrackingSummary)(booking);
};
exports.updateTrackingStatusUseCase = updateTrackingStatusUseCase;
/**
 * Air-Dry bookings, which have no journey: the customer takes the piece home
 * the same day, so the admin closes the booking in one step.
 */
const markBookingCollectedUseCase = async ({ bookingId }) => {
    assertBookingId(bookingId);
    const booking = await (0, workshopRepo_1.getBookingForTrackingRepo)(bookingId);
    if (!booking)
        throw new appError_1.default('No Workshop Booking Found', httpStatus_1.HttpStatus.NOT_FOUND);
    if (booking.tracking?.status) {
        throw new appError_1.default('This booking is tracked — update its tracking status instead', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.bookingStatus === 'collected') {
        throw new appError_1.default('This booking is already marked collected', httpStatus_1.HttpStatus.CONFLICT);
    }
    booking.bookingStatus = 'collected';
    await booking.save();
    return { bookingStatus: booking.bookingStatus };
};
exports.markBookingCollectedUseCase = markBookingCollectedUseCase;
/* ---------------- read models ---------------- */
/** What the dashboard shows next to the tracking controls. */
const buildTrackingSummary = (booking) => {
    const tracking = booking?.tracking;
    if (!tracking?.status) {
        return {
            isTracked: false,
            clayCategory: (0, potteryTracking_1.resolveClayCategory)(booking?.items || []),
            bookingStatus: booking?.bookingStatus,
        };
    }
    const dates = (0, potteryTracking_1.computeTrackingDates)(tracking.clayCategory, tracking.startedAt, {
        isDelayed: tracking.isDelayed,
        readyAt: tracking.readyAt,
    });
    return {
        isTracked: true,
        bookingStatus: booking.bookingStatus,
        clayCategory: tracking.clayCategory,
        clayLabel: potteryTracking_1.CLAY_TIMELINES[tracking.clayCategory].label,
        status: tracking.status,
        statusLabel: potteryTracking_1.STATUS_LABELS[tracking.status],
        itemCodes: tracking.itemCodes || [],
        token: tracking.token,
        trackingUrl: (0, exports.buildTrackingUrl)(tracking.token),
        startedAt: tracking.startedAt,
        // The stage timestamps the journey bar prints under each step. They are
        // written by applyStatusChange whoever moved the piece — the scheduler or
        // the admin — so they double as the record of when the automation actually
        // ran, rather than when it was supposed to.
        dryingAt: tracking.dryingAt || null,
        firingAt: tracking.firingAt || null,
        paintingAt: tracking.paintingAt || null,
        delayedAt: tracking.delayedAt || null,
        readyAt: tracking.readyAt || null,
        collectedAt: tracking.collectedAt || null,
        discardedAt: tracking.discardedAt || null,
        isDelayed: !!tracking.isDelayed,
        delayNote: tracking.delayNote || null,
        ...dates,
        emails: tracking.emails || {},
        history: tracking.history || [],
    };
};
exports.buildTrackingSummary = buildTrackingSummary;
/**
 * The public journey, keyed by nothing but the token from the email.
 *
 * A delayed piece is reported as sitting on the Firing step with the delay
 * flagged alongside, matching the studio's mock-ups: the journey has not gone
 * backwards, it is just taking longer.
 */
const getTrackingByTokenUseCase = async (token) => {
    if (!token || typeof token !== 'string') {
        throw new appError_1.default('Invalid tracking link', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const booking = await (0, workshopRepo_1.getBookingByTrackingTokenRepo)(token.trim());
    if (!booking?.tracking?.status) {
        throw new appError_1.default('We could not find that pottery item', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const tracking = booking.tracking;
    const category = tracking.clayCategory;
    const status = tracking.status;
    const dates = (0, potteryTracking_1.computeTrackingDates)(category, tracking.startedAt, {
        isDelayed: tracking.isDelayed,
        readyAt: tracking.readyAt,
    });
    const journey = (0, potteryTracking_1.getJourneySteps)(category);
    const stepDates = {
        created: tracking.startedAt,
        drying: tracking.dryingAt,
        firing: tracking.firingAt,
        painting: tracking.paintingAt,
        ready: tracking.readyAt,
        collected: tracking.collectedAt,
    };
    // A delay holds the piece at firing; a discarded piece stops wherever it got
    // to, which is always ready since only a ready piece can go uncollected.
    const currentIndex = journey.indexOf(journeyPosition(status));
    // Pieces moved on before backfillImpliedStageDates existed have no drying or
    // firing date; estimate them against the next step that does have one.
    let floor = tracking.startedAt;
    journey.forEach((step, index) => {
        if (index >= currentIndex)
            return;
        if (!stepDates[step] && potteryTracking_1.IMPLIED_STAGES.includes(step)) {
            const cap = journey
                .slice(index + 1, currentIndex + 1)
                .map((later) => stepDates[later])
                .find(Boolean) || new Date();
            stepDates[step] = (0, potteryTracking_1.estimateSkippedStageDate)(category, step, tracking.startedAt, cap, floor);
        }
        if (stepDates[step])
            floor = stepDates[step];
    });
    const steps = journey.map((step, index) => ({
        status: step,
        label: potteryTracking_1.STATUS_LABELS[step],
        state: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming',
        date: stepDates[step] || null,
    }));
    const currency = booking.currency || 'AED';
    // The page's summary card lists what was booked — "2 × AED 249.00" per
    // package — so the packages come through with their own price and count
    // rather than only the booking total.
    const items = (booking.items || []).map((item) => ({
        optionId: item.optionId,
        optionTitle: item.optionTitle,
        price: item.price,
        quantity: item.people,
        people: item.people,
        adult: item.adult ?? null,
        child: item.child ?? null,
        handBuild: item.handBuild ?? null,
        wheelPottery: item.wheelPottery ?? null,
        subtotal: item.subtotal,
    }));
    return {
        bookingNumber: booking.bookingNumber,
        workshopTitle: booking.workshopId?.title || '',
        bannerImage: booking.workshopId?.bannerImage || '',
        image: booking.workshopId?.image || '',
        customerName: [booking.customer?.firstName, booking.customer?.lastName]
            .filter(Boolean)
            .join(' '),
        customerEmail: booking.customer?.email || '',
        customerPhone: booking.customer?.phone || '',
        bookingDate: booking.bookingDate || null,
        startTime: booking.startTime || null,
        endTime: booking.endTime || null,
        makingType: booking.makingType || null,
        items,
        totalPeople: booking.totalPeople ?? null,
        currency,
        totalAmount: booking.totalAmount ?? null,
        taxAmount: booking.taxAmount ?? null,
        grandTotal: booking.grandTotal ?? null,
        support: STUDIO_CONTACT,
        clayCategory: category,
        clayLabel: potteryTracking_1.CLAY_TIMELINES[category].label,
        itemCodes: tracking.itemCodes || [],
        status,
        statusLabel: potteryTracking_1.STATUS_LABELS[status],
        ...potteryTracking_1.STATUS_COPY[status],
        isDelayed: !!tracking.isDelayed,
        steps,
        createdAt: tracking.startedAt,
        ...dates,
        collection: {
            hours: 'Monday – Sunday: 10:30 AM – 9:30 PM',
            studio: 'Bedia Pottery LLC',
            address: 'Al Khayat Avenue, Al Quoz, Dubai, UAE',
            mapUrl: STUDIO_MAP_URL,
        },
    };
};
exports.getTrackingByTokenUseCase = getTrackingByTokenUseCase;
/**
 * One pass of the automation: advance every piece whose next stage is due,
 * discard the ones nobody came back for, and send whatever emails that leaves
 * outstanding.
 *
 * Each booking is handled independently — one failure (a bad email address, a
 * validation error on an old row) must not stop the rest of the studio's pieces
 * from moving.
 */
const runTrackingAutomationUseCase = async (now = new Date()) => {
    const bookings = await (0, workshopRepo_1.findActiveTrackedBookingsRepo)();
    const summary = {
        scanned: bookings.length,
        advanced: 0,
        discarded: 0,
        emailed: 0,
        errors: 0,
    };
    for (const booking of bookings) {
        try {
            const tracking = booking.tracking;
            let dirty = false;
            const dates = (0, potteryTracking_1.computeTrackingDates)(tracking.clayCategory, tracking.startedAt, {
                isDelayed: tracking.isDelayed,
                readyAt: tracking.readyAt,
            });
            // Uncollected a month past the estimated collection date.
            const overdue = tracking.status === 'ready' &&
                dates.collectionDeadline &&
                now.getTime() >= dates.collectionDeadline.getTime();
            if (overdue) {
                applyStatusChange(booking, 'discarded', 'system', now, 'Not collected by the final collection date');
                summary.discarded += 1;
                dirty = true;
            }
            else {
                const next = (0, potteryTracking_1.getNextAutoStatus)(tracking.clayCategory, tracking.status, tracking.startedAt, now.getTime());
                if (next) {
                    applyStatusChange(booking, next, 'system', now);
                    summary.advanced += 1;
                    dirty = true;
                }
            }
            if (dirty)
                await booking.save();
            if (await (0, exports.dispatchTrackingEmails)(booking, now)) {
                summary.emailed += 1;
                await booking.save();
            }
        }
        catch (error) {
            summary.errors += 1;
            console.error(`TRACKING AUTOMATION FAILED for booking ${booking?._id}:`, error?.message || error);
        }
    }
    return summary;
};
exports.runTrackingAutomationUseCase = runTrackingAutomationUseCase;
