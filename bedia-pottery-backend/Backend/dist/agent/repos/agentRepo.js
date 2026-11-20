"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = exports.updateAgentById = exports.deleteAgentById = exports.fetchAgentBySlug = exports.fetchAgentById = exports.fetchAllAgentsForAdmin = exports.fetchAllAgents = exports.getAgentsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const agentModel_1 = __importDefault(require("../models/agentModel"));
const getAgentsCount = async (query) => {
    return await agentModel_1.default.countDocuments(query);
};
exports.getAgentsCount = getAgentsCount;
const fetchAllAgents = async (query, skip, limit) => {
    return await agentModel_1.default
        .find(query)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 }) // add _id:0 later
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAgents = fetchAllAgents;
const fetchAllAgentsForAdmin = async (query, skip, limit) => {
    return await agentModel_1.default
        .find(query)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllAgentsForAdmin = fetchAllAgentsForAdmin;
const fetchAgentById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await agentModel_1.default
        .findOne(dbQuery)
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchAgentById = fetchAgentById;
const fetchAgentBySlug = async (query) => {
    return await agentModel_1.default
        .findOne(query)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchAgentBySlug = fetchAgentBySlug;
const deleteAgentById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await agentModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteAgentById = deleteAgentById;
const updateAgentById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await agentModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateAgentById = updateAgentById;
const createAgent = async (data) => {
    return await agentModel_1.default.create(data);
};
exports.createAgent = createAgent;
