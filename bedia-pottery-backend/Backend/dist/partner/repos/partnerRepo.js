"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPartner = exports.updatePartnerById = exports.deletePartnerById = exports.fetchPartnerById = exports.fetchAllPartnersForAdmin = exports.fetchAllPartners = exports.getPartnersCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const partnerModel_1 = __importDefault(require("../models/partnerModel"));
const getPartnersCount = async (query) => {
    return await partnerModel_1.default.countDocuments(query);
};
exports.getPartnersCount = getPartnersCount;
const fetchAllPartners = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await partnerModel_1.default
        .find(dbQuery)
        .select({ name: 1, logo: 1, _id: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllPartners = fetchAllPartners;
const fetchAllPartnersForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await partnerModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllPartnersForAdmin = fetchAllPartnersForAdmin;
const fetchPartnerById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await partnerModel_1.default
        .findOne(dbQuery)
        .select({ name: 1, logo: 1, websiteUrl: 1, _id: 0 })
        .lean();
};
exports.fetchPartnerById = fetchPartnerById;
const deletePartnerById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await partnerModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deletePartnerById = deletePartnerById;
const updatePartnerById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await partnerModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updatePartnerById = updatePartnerById;
const createPartner = async (data) => {
    return await partnerModel_1.default.create(data);
};
exports.createPartner = createPartner;
