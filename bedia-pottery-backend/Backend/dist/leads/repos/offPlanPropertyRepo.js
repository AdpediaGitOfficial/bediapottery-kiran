"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBrochureBySlug = exports.fetchFloorPlanBySlug = exports.getOffPlanPropertiesCount = void 0;
const offPlanPropertyModel_1 = __importDefault(require("../../offplan/models/offPlanPropertyModel"));
const getOffPlanPropertiesCount = async (query) => {
    return await offPlanPropertyModel_1.default.countDocuments(query);
};
exports.getOffPlanPropertiesCount = getOffPlanPropertiesCount;
const fetchFloorPlanBySlug = async (slug) => {
    return await offPlanPropertyModel_1.default
        .findOne({ isDeleted: false, slug })
        .select({ floorPlanPDF: 1 })
        .lean();
};
exports.fetchFloorPlanBySlug = fetchFloorPlanBySlug;
const fetchBrochureBySlug = async (slug) => {
    return await offPlanPropertyModel_1.default
        .findOne({ isDeleted: false, slug })
        .select({ brochure: 1 })
        .lean();
};
exports.fetchBrochureBySlug = fetchBrochureBySlug;
