"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * A window the studio is closed to website bookings — a private hire, a class
 * taken at the counter, maintenance. The studio is one shared room, so a block
 * applies to every workshop whose slot runs during it.
 *
 * `date` is stored as the same plain "YYYY-MM-DD" string bookings use, so both
 * are matched as UAE calendar days with no timezone conversion in between.
 */
const blockedTimeSchema = new mongoose_1.Schema({
    date: { type: String, required: true, index: true },
    allSlots: { type: Boolean, default: false },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    reason: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const BlockedTimeModel = (0, mongoose_1.model)('blocked_times', blockedTimeSchema);
exports.default = BlockedTimeModel;
