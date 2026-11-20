"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllLeadsByDate = exports.fetchAllLeads = exports.getLeadsCount = exports.createQuestionnaireLead = exports.createLeads = void 0;
const leadsModel_1 = __importDefault(require("../models/leadsModel"));
const createLeads = async (data) => {
    return await leadsModel_1.default.create(data);
};
exports.createLeads = createLeads;
const createQuestionnaireLead = async (data) => {
    return await leadsModel_1.default.create(data);
};
exports.createQuestionnaireLead = createQuestionnaireLead;
const getLeadsCount = async (query) => {
    return await leadsModel_1.default.countDocuments(query);
};
exports.getLeadsCount = getLeadsCount;
const fetchAllLeads = async (query, skip, limit, sortCriteria) => {
    return await leadsModel_1.default
        .find(query)
        .select({
        __v: 0,
        isDeleted: 0,
        createdAt: 0,
    })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllLeads = fetchAllLeads;
const fetchAllLeadsByDate = async (query) => {
    return await leadsModel_1.default.find(query).select({
        __v: 0,
        isDeleted: 0,
        createdAt: 0,
    });
};
exports.fetchAllLeadsByDate = fetchAllLeadsByDate;
