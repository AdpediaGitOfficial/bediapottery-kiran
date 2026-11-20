"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobApplication = exports.fetchJobApplicationByEmail = exports.fetchAllJobApplications = exports.getJobApplicationsCount = void 0;
const jobApplicationModel_1 = __importDefault(require("../models/jobApplicationModel"));
const getJobApplicationsCount = async (query) => {
    return await jobApplicationModel_1.default.countDocuments(query);
};
exports.getJobApplicationsCount = getJobApplicationsCount;
const fetchAllJobApplications = async (query, skip, limit) => {
    return await jobApplicationModel_1.default
        .find(query)
        .select({
        isDeleted: 0,
        coverLetter: 0,
        updatedAt: 0,
        __v: 0,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllJobApplications = fetchAllJobApplications;
const fetchJobApplicationByEmail = async (query) => {
    return await jobApplicationModel_1.default.findOne(query).select({ _id: 1 }).lean();
};
exports.fetchJobApplicationByEmail = fetchJobApplicationByEmail;
const createJobApplication = async (data) => {
    return await jobApplicationModel_1.default.create(data);
};
exports.createJobApplication = createJobApplication;
